"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import Link from "next/link";

const client = generateClient<Schema>();

// Interfaces for garment and catalog data
interface Garment {
  id: number;
  src: string;
  alt: string;
  vendor: string;
  price: string;
}
interface CategoryGarments {
  "Tops": Garment[];
  "Bottoms": Garment[];
  "Dresses": Garment[];
}
interface Catalog {
  "Men's": CategoryGarments;
  "Women's": CategoryGarments;
}

export default function FittingRoomPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedImages, setSavedImages] = useState<{ url: string; id: string }[]>([]);
  const [userId, setUserId] = useState<string>("");

  // fitting room states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [gender, setGender] = useState<"Men's" | "Women's">("Men's");
  const [category, setCategory] = useState<"Tops" | "Bottoms" | "Dresses">("Tops");
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  // try-on states
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);

  // Catalog data
  const catalog : Catalog = {
    "Men's": {
      Tops: [
        { id: 1, src: "/mens_top1.png", alt: "Men's Top 1", vendor: "Abercrombie & Fitch", price: "$45" },
        { id: 2, src: "/mens_top2.png", alt: "Men's Top 2", vendor: "Abercrombie & Fitch", price: "$50" },
        { id: 3, src: "/mens_top3.png", alt: "Men's Top 3", vendor: "Abercrombie & Fitch", price: "$55" },
      ],
      Bottoms: [],
      Dresses: [],
    },
    "Women's": {
      Tops: [
        { id: 13, src: "/womens_top1.png", alt: "Women's Top 1", vendor: "Abercrombie & Fitch", price: "$40" },
        { id: 14, src: "/womens_top2.png", alt: "Women's Top 2", vendor: "Abercrombie & Fitch",  price: "$45" },
        { id: 15, src: "/womens_top3.png", alt: "Women's Top 3", vendor: "Abercrombie & Fitch", price: "$40" },
      ],
      Bottoms: [],
      Dresses: [],
    },
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.userId);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchSavedPhotos();
    }
  }, [userId]);

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
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleTryOn = async () => {
    // validate inputs
    if (!uploadedImage || !selectedGarment) return;
    // reset states
    setIsProcessing(true);
    setTaskId(null);
    setTryOnResult(null);
    setTaskStatus(null);

    try {
      // convert images to pure base64
      const base64HumanImage = uploadedImage.split(",")[1];
      const garmentUrl = `/Garments${selectedGarment.src}`;
      const base64GarmentImageFull = await getBase64Url(garmentUrl);
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
            <div className="flex-1 h-fit flex-col gap-2">
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
                  <div className="bg-[var(--jet)] text-white font-sans px-6 py-2 rounded-full w-full flex items-center justify-center gap-2 mouse-pointer whitespace-nowrap text-sm min-w-0">
                    <span className="text-md">↑</span> Upload
                  </div>
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
                      href="/dashboard" 
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
                          onClick={() => setUploadedImage(`/GoodEx${num}.png`)}
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
            <div className="flex flex-col flex-2 h-fit relative bg-[var(--bone)] rounded-xl pt-5 pb-10 px-5 items-center">
                <h2 className="text-xl font-sans text-center font-bold">Browse our catalouge</h2>
                {/* selection container */}
                <div className="flex flex-row items-center justify-center gap-10 w-full py-2 font-sans">
                  <select value={gender} onChange={(e) => setGender(e.target.value as "Men's" | "Women's")} className="">
                    <option value={"Men's"}>Men's</option>
                    <option value={"Women's"}>Women's</option>
                  </select>
                  <select value={category} onChange={(e) => setCategory(e.target.value as "Tops" | "Bottoms" | "Dresses")} className="">
                    <option value={"Tops"}>Tops</option>
                    <option value={"Bottoms"}>Bottoms</option>
                    <option value={"Dresses"}>Dresses</option>
                  </select>
                </div>

                {/* Garment selection */}
                <div className="flex flex-wrap justify-center gap-8 w-full mt-4 px-5 pb-10">
                  {catalog[gender][category].map((garment: Garment) => (
                    <div key={garment.id} onClick={() => {selectedGarment?.src === garment.src ? setSelectedGarment(null) : setSelectedGarment(garment)}} className="relative flex items-center cursor-pointer rounded-xl font-sans">
                      <Image src={`/Garments${garment.src}`} alt={garment.alt} width={155} height={150} className="object-fit rounded-xl"/>
                      {selectedGarment && selectedGarment?.src === garment.src && (
                        <div className="absolute inset-0 border-2 border-[var(--taupe)] rounded-xl"/>
                      )}
                    </div>
                  ))}
                </div>

                {/* try on button */}
                <button
                  className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[var(--taupe)] w-4/5 text-white px-6 py-1 rounded-full text-lg md:text-xl transition ${!(selectedGarment && uploadedImage) ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!selectedGarment || !uploadedImage || isProcessing}
                  onClick={handleTryOn}>
                  {isProcessing ? 'Processing...' : 'Try on'}
                </button>
            </div>

            {/* Try-on section */}
            <div className="flex flex-col h-4/5 mb-4 flex-1 p-5 bg-[var(--bone)] rounded-xl items-center">
              <h2 className="text-xl mb-2 font-sans font-bold text-center">Try on</h2>
              {isProcessing || taskStatus === "submitted" || taskStatus === "processing" ? (
                <>
                  
                  <div className="relative flex h-12 w-12 mt-20 mb-20">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--taupe)]"></div>
                    <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-black-600"></div>
                  </div>
                  <p className="text-center font-sans">Processing...</p>
                </>
                
              ) : tryOnResult ? (
                <Image src={tryOnResult} alt="Try-On Result" width={512} height={512} className="rounded-xl mx-auto" />
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