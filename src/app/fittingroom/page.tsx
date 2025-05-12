"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import Link from "next/link";
import { AnimationPlaybackControls } from "framer-motion";

const client = generateClient<Schema>();

async function getAuthMode() {
  try {
    await getCurrentUser();
    return 'userPool';
  } catch {
    return 'iam';
  }
}

export default function FittingRoomPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedImages, setSavedImages] = useState<{ url: string; id: string }[]>([]);
  const [userId, setUserId] = useState<string>("");

  // fitting room states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  // try-on states
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>("");
  const [triedOnProduct, setTriedOnProduct] = useState<any | null>(null);
  // retailer states
  const [retailers, setRetailers] = useState<{id: string, name: string}[]>([]);
  const [selectedRetailer, setSelectedRetailer] = useState<{id: string}>();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.userId);
        setIsAuthenticated(true);
        fetchRetailers('userPool');
      } catch {
        setIsAuthenticated(false);
        await fetchRetailers('iam');
      }
    };
    checkAuth();
  }, []);

  const fetchRetailers = async (authMode: string) => {
    console.log("isAuthenticated: ", isAuthenticated);
    console.log("Fetching retailers with auth mode:", authMode);
    try {
      const { data: retailersRaw, errors } = await client.models.Retailer.list({
        ...(authMode === 'userPool' ? {} : { authMode: 'iam' })
      });

      if (errors) {
        console.error("Error fetching retailers:", errors);
        return;
      }
      console.log("Raw Retailers:", retailersRaw);
      setRetailers(retailersRaw.map((retailer) => ({
        id: retailer?.id,
        name: retailer?.name
      })));
    } catch (error) {
      console.error("Error fetching retailers:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSavedPhotos();
    }
  }, [userId]);

  // init slected retailer to 1st loaded by default
  useEffect(() => {
    if (retailers.length > 0) {
      setSelectedRetailer({id: retailers[0].id});
    }
  }, [retailers]);

  // load products when retailer changes
  useEffect(() => {
    if (selectedRetailer) {
      loadProducts(selectedRetailer.id);
    }
  }, [selectedRetailer]);

  const fetchSavedPhotos = async () => {
    try {
      const { data: photos, errors } = await client.models.UserPhoto.list({
        filter: {
          userId: { eq: userId },
          type: { eq: 'SAVED' }
        }
      });
      
      if (errors) {
        console.error('Errors fetching photos:', errors);
        return;
      }
      
      const photoData = photos.map(photo => ({
        url: photo.photoUrl,
        id: photo.id
      }));
      setSavedImages(photoData);
    } catch (error) {
      console.error('Error fetching saved photos:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPEG or PNG image.");
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      alert("File size exceeds 5MB. Please upload a smaller image.");
      return;
    }

    // Read and display the image
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.onerror = () => {
      alert("Error reading the file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const getBase64Url = async (url: string): Promise<string> => {
    try {
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Base64 URL return from /api/proxy-image:", data.base64);
      return data.base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const getLocalBase64Url = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting local image to base64:', error);
      throw error;
    }
  };

  const handleTryOn = async () => {
    // validate inputs
    if (!uploadedImage || !selectedProduct) return;
    // reset states
    setIsProcessing(true);
    setTaskId(null);
    setTryOnResult(null);
    setTaskStatus(null);
    setTriedOnProduct(selectedProduct);
    try {
      // convert images to pure base64
      console.log("Selected product for try-on:", selectedProduct);
      const base64HumanImage = uploadedImage.split(",")[1];
      console.log("Base64 human image:", base64HumanImage);
      const garmentUrl = selectedProduct.frontEndImageUrl;
      console.log("Garment URL:", garmentUrl);
      const base64GarmentImageFull = await getBase64Url(garmentUrl);
      console.log("Base64 garment image:", base64GarmentImageFull);
      const base64GarmentImage = base64GarmentImageFull.split(",")[1];
      // make call to /api/try-on
      const response = await fetch("../api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          human_image: base64HumanImage,
          cloth_image: base64GarmentImage,
        }),
      });
      // Gather result
      const result = await response.json();
      console.log("RESULT FROM /api/try-on: ", result);
      if (response.ok) {
        setTaskId(result.taskId);
        setTaskStatus(result.taskStatus);
      } else {
        throw new Error(result.error || "Failed to contact /api/try-on");
      }
    } catch (error) {
      console.error("Error trying to contact /api/try-on", error);
      alert("Failed to process try-on request, please try again.");
      setIsProcessing(false);
    }
  };

  // Submit email confirmation to me
  const emailConfirmation = async (result: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: "sreenand6@gmail.com",
          message: result,
          to: "sreenand6@gmail.com",
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Email confirmation sent successfully");
      } else {
        console.error("Failed to send email confirmation:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Confirmation submission error:", error);
    }
  };

  // Polling for result
  useEffect(() => {
    if (!taskId || tryOnResult) return;
  
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/try-on-callback?taskId=${taskId}`);
        if (!response.ok) {
          console.error("Callback responded with: ", response.status);
        }
        const data = await response.json();
        console.log("Polling result: ", data);
        
        // Update task status
        setTaskStatus(data.status || null);
  
        if (data.status === "succeed" && data.result) {
          // Set the result and stop processing
          setTryOnResult(data.result);
          setIsProcessing(false);
          
          // Send email with the result
          await emailConfirmation(data.result); // Call email function with the result directly

          clearInterval(interval); // Stop polling

          // Save the look
          if (isAuthenticated) {
            const savedLook = {
              userId: userId,
              productId: triedOnProduct.id,
              photoUrl: data.result,
            }
            const { data: savedLookResult, errors } = await client.models.TryOnInstance.create(savedLook);
            if (errors) {
              console.error("Error saving look:", errors);
            } else {
              console.log("Look saved successfully:", savedLookResult);
            }
          }
          
        } else if (data.status === "failed") {
          setIsProcessing(false);
          clearInterval(interval); // Stop polling on failure
        } else if (data.error) {
          console.log("Task not found yet, continuing to poll...");
        }
      } catch (error) {
        console.error("Error polling task status:", error);
      }
    }, 5000);
  
    return () => clearInterval(interval);
  }, [taskId, tryOnResult]);

  const loadProducts = async (retailerId: string) => {
    const authMode = await getAuthMode();
    console.log("Retailer ID to fetch products:", retailerId, "with authMode:", authMode);
    const { data: products, errors } = await client.models.Product.list({
      filter: {
        retailerId: { eq: retailerId }
      },
      authMode
    });
  
    if (errors) {
      console.error("Error fetching products:", errors);
    } else {
      console.log("Products:", products);
      setProducts(products);
    }
  }


  return (
    <div className="w-full min-h-screen bg-[var(--linen)] flex flex-col px-2 md:px-0 mb-60">
      <div className="w-screen h-screen flex flex-col md:flex-row justify-center">
         {/* Fitting Room */}
        <div className="w-full h-full flex flex-col mt-30 sm:mt-20 gap-10 px-10 md:px-20">
          {/* Header */}
          <div className="flex flex-row items-end border-b-2 border-[var(--taupe)]] justify-between pt-15 md:pt-10 pb-1">
            <div className="flex flex-col">
              <p className="font-sans">Welcome to the</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl">Fitting Room</h1>
            </div>
            <div className="flex flex-col items-end">
              <h1 className="text-xs sm:text-md lg:text-lg font-sans"></h1>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col lg:flex-row gap-6">
            {/* Upload section */}
            <div className="flex flex-1 h-fit flex-col gap-2">
              <div className="relative bg-[var(--bone)] rounded-xl pt-5 pb-10 px-5 justify-center items-center">
                <h2 className="text-xl mb-2 font-sans text-center font-bold">Upload your picture</h2>
                <div className="flex-1 relative pb-10 px-5">
                  {uploadedImage ? (
                    <div className="relative">
                      <Image
                        src={uploadedImage}
                        alt="Uploaded Image"
                        width={512}
                        height={512}
                        className="rounded-lg"
                      />
                      <button onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 px-3 py-1 bg-[var(--taupe)] rounded-full text-white font-sans z-15">x</button>
                    </div>
                  ) : (
                    <>
                      <p className="font-sans mb-2 text-center underline">Guidelines:</p>
                      <ul className="list-disc pl-5 space-y-2 font-sans text-sm text-center">
                        <li>Simple pose</li>
                        <li>Clear solo photo</li>
                        <li>Unobstructed face</li>
                        <li>Subject is at least 5-6 feet from the camera</li>
                        <li>Portrait oriented with width = 512px and length = 4096px</li>
                      </ul>
                    </>
                  )}
                </div>
                <label className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-4/5`}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {!uploadedImage && <div className="bg-[var(--jet)] text-white font-sans px-6 py-2 rounded-full w-full flex items-center justify-center gap-2 mouse-pointer whitespace-nowrap text-sm min-w-0">
                    <span className="text-md">↑</span> Upload
                  </div>}
                </label>
              </div>

              {/* Example/Saved Images Section */}
              <div className="relative bg-[var(--bone)] rounded-xl p-4 border border-[var(--taupe)] mt-2">
                <h2 className="text-sm font-bold text-[var(--jet)] font-sans">
                  {isAuthenticated ? "" : "Example Images"}
                </h2>
                
                {isAuthenticated && savedImages.length === 0 ? (
                  <div className="text-center py-2">
                    <Link 
                      href="/user/dashboard" 
                      className="inline-block bg-[var(--taupe)] text-white px-4 py-1 rounded-full hover:bg-opacity-80 transition text-sm font-sans"
                    >
                      Save images for quick access
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {isAuthenticated ? (
                      // Display user's saved images
                      savedImages.map((photo, index) => (
                        <div 
                          key={photo.id} 
                          className="relative aspect-square cursor-pointer hover:opacity-90 transition"
                          onClick={async () => {
                            try {
                              const base64Image = await getBase64Url(photo.url);
                              setUploadedImage(base64Image);
                            } catch (error) {
                              console.error("Error converting saved image to base64:", error);
                              alert("Failed to load saved image. Please try again.");
                            }
                          }}
                        >
                          <img
                            src={photo.url}
                            alt={`Saved photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      ))
                    ) : (
                      // Display example images
                      [1, 2, 3].map((num) => (
                        <div 
                          key={num} 
                          className="relative aspect-square cursor-pointer hover:opacity-90 transition mt-2"
                          onClick={async () => {
                            try {
                              const base64Image = await getLocalBase64Url(`/GoodEx${num}.png`);
                              setUploadedImage(base64Image);
                            } catch (error) {
                              console.error("Error converting example image to base64:", error);
                              alert("Failed to load example image. Please try again.");
                            }
                          }}
                        >
                          <Image
                            src={`/GoodEx${num}.png`}
                            alt={`Example ${num}`}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Catalogue */}
            <div className="flex flex-col flex-2 h-fit relative bg-[var(--linen)] border-3 border-[var(--taupe)]/50 rounded-xl pt-5 pb-10 px-5 items-center md:mb-20">
                <div className="flex flex-row items-center justify-center gap-2">
                  <h2 className="text-xl font-sans font-bold">Shop </h2>
                  <select 
                    className="bg-transparent rounded-md text-center cursor-pointer text-xl font-sans flex-1"
                    onChange={(e) => {
                      setSelectedRetailer({id: e.target.value});
                    }}
                  >
                    {retailers.map((retailer) => (
                      <option key={retailer.id} value={retailer.id}>
                        {retailer.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* selection container */}
                {/* <div className="flex flex-row items-center justify-center gap-10 w-full py-2 font-sans">
                  <select value={gender} onChange={(e) => setGender(e.target.value as "Men's" | "Women's")} className="">
                    <option value={"Men's"}>Men's</option>
                    <option value={"Women's"}>Women's</option>
                  </select>
                  <select value={category} onChange={(e) => setCategory(e.target.value as "Tops" | "Bottoms" | "Dresses")} className="">
                    <option value={"Tops"}>Tops</option>
                    <option value={"Bottoms"}>Bottoms</option>
                    <option value={"Dresses"}>Dresses</option>
                  </select>
                </div> */}

                {/* Garment selection */}
                <div className="flex flex-wrap justify-center gap-2 w-full mt-4 px-5 pb-10">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="relative bg-[var(--bone)] rounded-xl shadow-md p-2 flex flex-col items-center transition hover:shadow-lg"
                      style={{ width: 180, minWidth: 180, height: 320 }}
                      onClick={() => {selectedProduct?.id === product.id ? setSelectedProduct(null) : setSelectedProduct(product)}}
                    >
                      <div className="relative w-full h-[220px] mb-2 overflow-hidden rounded-lg">
                        <Image
                          src={product.frontEndImageUrl}
                          alt={product.name}
                          width={180}
                          height={220}
                          className="w-full h-full object-cover absolute inset-0 rounded-lg"
                        />
                      </div>
                      <div className="w-full flex flex-col items-start">
                        <span className="font-bold text-base text-[var(--jet)] font-sans">{product.name}</span>
                        <span className="text-xs text-[var(--jet)] font-sans mb-1 line-clamp-2">{product.description}</span>
                        <span className="text-sm text-[var(--taupe)] font-semibold font-sans">${product.price}</span>
                        <span className="text-xs text-[var(--jet)] font-sans mb-1 line-clamp-2">{product.gender === "MALE" ? "Men's" : product.gender === "FEMALE" ? "Women's" : "Unisex"}</span>
                        {/* <span className="text-xs text-[var(--jet)] font-sans mb-1 line-clamp-2">{product.type === "TOP" ? "Top" : product.type === "BOTTOM" ? "Bottom" : "Dress"}</span> */}
                      </div>
                      {selectedProduct && selectedProduct?.id === product.id && (
                        <div className="absolute inset-0 border-2 border-[var(--taupe)] rounded-xl pointer-events-none"/>
                      )}
                    </div>
                  ))}
                </div>

                {/* try on button */}
                <button
                  className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[var(--taupe)] w-4/5 text-white px-6 py-1 rounded-full text-lg md:text-xl transition ${!(selectedProduct && uploadedImage) ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!selectedProduct || !uploadedImage || isProcessing}
                  onClick={handleTryOn}>
                  {isProcessing ? 'Processing...' : 'Try on'}
                </button>
            </div>

            {/* Try-on section */}
            <div className="flex flex-col flex-1 mb-4 p-5 bg-[var(--bone)] rounded-xl items-center max-h-[800px] overflow-auto">
              <h2 className="text-xl mb-2 font-sans font-bold">Try on</h2>
              {isProcessing || taskStatus === "submitted" || taskStatus === "processing" ? (
                <>
                  <div className="relative flex h-12 w-12 mt-20 mb-20">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--taupe)]"></div>
                    <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-black-600"></div>
                  </div>
                  <p className="text-center font-sans">Trying on...</p>
                  <p className="text-center font-sans">Estimated time: 20-40 sec</p>
                </>
                
              ) : tryOnResult ? (
                <div className="w-full flex flex-col items-center">
                  <Image 
                    src={tryOnResult} 
                    alt="Try-On Result" 
                    width={512} 
                    height={512} 
                    className="rounded-t-xl max-w-full max-h-full object-contain"
                  />
                  {triedOnProduct && (
                    <div className="bg-[var(--taupe)]/90 rounded-b-xl shadow-md p-4 flex flex-row justify-between w-full">
                      <div className="flex flex-col items-start">
                        <span className="text-base text-white font-sans">{triedOnProduct.name}</span>
                        <span className="text-xs text-white font-sans mb-1 line-clamp-3">{triedOnProduct.description}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-[var(--linen)] font-sans">${triedOnProduct.price}</span>
                        <span className="text-xs text-[var(--linen)] font-sans mb-1 line-clamp-3">{triedOnProduct.gender === "MALE" ? "Men's" : triedOnProduct.gender === "FEMALE" ? "Women's" : "Unisex"}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : taskStatus === "failed" ? (
                <p className="text-center font-sans font-red-800">Try-on failed, please try again</p>
              ) : (
                <p className="text-center font-sans">No result to show yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}