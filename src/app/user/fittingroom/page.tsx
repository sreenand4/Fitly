"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import Link from "next/link";
import { AnimationPlaybackControls } from "framer-motion";
import { Sprout } from "lucide-react";
import { uploadData } from 'aws-amplify/storage';

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
  const [activeUserImageS3Url, setActiveUserImageS3Url] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isUploadingNewUserImage, setIsUploadingNewUserImage] = useState(false);

  // try-on states
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [triedOnProduct, setTriedOnProduct] = useState<any | null>(null);
  // retailer states
  const [retailers, setRetailers] = useState<{id: string, name: string}[]>([]);
  const [selectedRetailer, setSelectedRetailer] = useState<{id: string}>();
  const [products, setProducts] = useState<any[]>([]);

  // Survey Modal States
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyConfidence, setSurveyConfidence] = useState<string>("");
  const [surveyLikelihoodReturn, setSurveyLikelihoodReturn] = useState<string>("");
  const [surveyLikelihoodBuy, setSurveyLikelihoodBuy] = useState<string>("");
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.userId);
        console.log("User authenticated, userId:", user.userId);
        setIsAuthenticated(true);
        fetchRetailers('userPool');
      } catch {
        setIsAuthenticated(false);
        console.log("User not authenticated, fetching retailers with IAM.");
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
      console.log("useEffect: userId available (", userId, "), fetching saved photos.");
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
      console.log("useEffect: selectedRetailer changed, loading products for retailerId:", selectedRetailer.id);
      loadProducts(selectedRetailer.id);
    }
  }, [selectedRetailer]);

  const fetchSavedPhotos = async () => {
    console.log("fetchSavedPhotos: Fetching saved photos for userId:", userId);
    try {
      const { data: photos, errors } = await client.models.UserPhoto.list({
        filter: {
          userId: { eq: userId },
          type: { eq: 'SAVED' }
        }
      });
      
      if (errors) {
        console.error('fetchSavedPhotos: Errors fetching photos:', errors);
        return;
      }
      
      console.log("fetchSavedPhotos: Raw photos from DB:", photos);
      const photoData = photos.map(photo => ({
        url: photo.photoUrl,
        id: photo.id
      }));
      setSavedImages(photoData);
      console.log("fetchSavedPhotos: Mapped photoData for state:", photoData);
    } catch (error) {
      console.error('fetchSavedPhotos: Error fetching saved photos:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
        console.log("handleImageUpload: No file selected.");
        return;
    }
    console.log("handleImageUpload: File selected:", file.name, file.type, file.size);

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPEG or PNG image.");
      console.warn("handleImageUpload: Invalid file type:", file.type);
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      alert("File size exceeds 5MB. Please upload a smaller image.");
      console.warn("handleImageUpload: File size exceeds 5MB:", file.size);
      return;
    }

    // For local preview
    const reader = new FileReader();
    reader.onload = () => {
      console.log("handleImageUpload: FileReader onload - setting uploadedImage for preview.");
      setUploadedImage(reader.result as string);
    };
    reader.onerror = () => {
      alert("Error reading the file. Please try again.");
      console.error("handleImageUpload: FileReader onerror.");
    };
    reader.readAsDataURL(file);

    // If user is authenticated, upload to S3 and save to DB
    if (isAuthenticated && userId) {
      setIsUploadingNewUserImage(true);
      console.log("handleImageUpload: Authenticated user, starting S3 upload for new image.");
      try {
        const s3Path = `saved-photos/${Date.now()}-${file.name}`; // Unique path
        console.log("handleImageUpload: Uploading to S3 path:", s3Path);
        const uploadResult = await uploadData({
          data: file,
          path: s3Path,
          options: { contentType: file.type }
        }).result;
        console.log("handleImageUpload: S3 upload successful:", uploadResult);
        
        // Construct permanent S3 URL (logic adapted from ImageUploader.tsx)
        // For src/app/user/fittingroom/page.tsx, it should be ../../../../amplify_outputs.json
        const amplifyOutputs = require('../../../../amplify_outputs.json'); 
        const bucketName = amplifyOutputs.storage.bucket_name;
        const region = amplifyOutputs.storage.aws_region || 'us-east-2'; // Use configured region or default
        const constructedS3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${uploadResult.path}`; // S3 paths from uploadData are relative to 'public/' if access level is public

        console.log("handleImageUpload: Constructed S3 URL:", constructedS3Url);
        setActiveUserImageS3Url(constructedS3Url); // Set for API call

        // Save to UserPhoto model
        console.log("handleImageUpload: Saving new UserPhoto to database.");
        const newUserPhoto = {
          userId: userId,
          photoUrl: constructedS3Url,
          type: 'SAVED' as const, // As per requirement
        };
        const { data: createdPhoto, errors: createErrors } = await client.models.UserPhoto.create(newUserPhoto);

        if (createErrors) {
          console.error("handleImageUpload: Error saving UserPhoto to DB:", createErrors);
          alert("Failed to save uploaded image to your gallery. Please try again.");
        } else if (createdPhoto) {
          console.log("handleImageUpload: UserPhoto saved successfully to DB:", createdPhoto);
          // Add to local savedImages state to update UI
          setSavedImages(prev => [...prev, { url: createdPhoto.photoUrl, id: createdPhoto.id }]);
        }
      } catch (err) {
        console.error("handleImageUpload: Error during S3 upload or DB save:", err);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploadingNewUserImage(false);
        console.log("handleImageUpload: S3 upload process finished (either success or fail).");
      }
    } else {
        console.log("handleImageUpload: User not authenticated, only setting local preview. S3 URL will not be set for API unless an existing image is chosen.");
        setActiveUserImageS3Url(null); // Ensure no old S3 URL is lingering if user was previously auth'd
    }
  };

  const getBase64Url = async (url: string): Promise<string> => {
    console.log("getBase64Url: Attempting to fetch and convert URL to base64:", url);
    try {
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        console.error(`getBase64Url: Failed to fetch image via proxy: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("getBase64Url: Successfully fetched base64 from /api/proxy-image for URL:", url);
      return data.base64;
    } catch (error) {
      console.error('getBase64Url: Error converting image to base64:', error);
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
    console.log("handleTryOn: Initiating new try-on process. Clearing previous states first.");

    // Reset states for the new try-on session AT THE BEGINNING
    setTryOnResult(null);
    setTriedOnProduct(null); // Clear this so product details don't linger from a previous attempt if current one fails early
    setTaskId(null);
    setTaskStatus("Starting..."); // Initial status for the new request
    setEstimatedCompletionTime(null);
    setIsProcessing(true); // Set processing to true immediately

    // Validate inputs (these should still be populated from user actions)
    if (!activeUserImageS3Url) {
        alert("Please upload or select your image for the try-on.");
        console.warn("handleTryOn: Missing activeUserImageS3Url.");
        return;
    }
    if (!selectedProduct) {
        alert("Please select a product to try on.");
        console.warn("handleTryOn: Missing selectedProduct.");
        return;
    }
    if (!selectedProduct.frontEndImageUrl) {
        alert("Selected product is missing an image. Please select another product.");
        console.warn("handleTryOn: Selected product missing frontEndImageUrl.", selectedProduct);
        return;
    }

    console.log("handleTryOn: Inputs validated. User S3 URL:", activeUserImageS3Url, "Product S3 URL:", selectedProduct.frontEndImageUrl);

    setTriedOnProduct(selectedProduct); // Keep this here to associate the current product with the attempt

    try {
      // Images are now direct S3 URLs
      const personImageUrl = activeUserImageS3Url;
      const garmentImageUrl = selectedProduct.frontEndImageUrl; // Already an S3 URL

      console.log("handleTryOn: Person Image URL:", personImageUrl);
      console.log("handleTryOn: Garment Image URL:", garmentImageUrl);
      
      console.log("handleTryOn: Making call to ../api/try-on with S3 URLs.");
      const response = await fetch("../api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_image_url: personImageUrl, // Use S3 URL
          outfit_image_url: garmentImageUrl, // Use S3 URL
        }),
      });
      
      const result = await response.json();
      console.log("handleTryOn: Response from ../api/try-on: ", JSON.stringify(result, null, 2));

      if (response.ok && result.taskId) {
        setTaskId(result.taskId);
        setTaskStatus(result.taskStatus || "pending"); // Use status from bitStudio
        if (result.rawResponse && result.rawResponse.estimated_completion) {
            setEstimatedCompletionTime(result.rawResponse.estimated_completion);
            console.log("handleTryOn: Estimated completion time from bitStudio:", result.rawResponse.estimated_completion);
        }
      } else {
        console.error("handleTryOn: Failed to initiate try-on via /api/try-on. Response:", result);
        throw new Error(result.error || "Failed to start try-on process with bitStudio API");
      }
    } catch (error: any) {
      console.error("handleTryOn: Error during try-on process:", error.message, error);
      alert("Failed to process try-on request. Please try again. Error: " + error.message);
      setIsProcessing(false);
      setTaskStatus("Error");
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

  // Polling for result (Updated for bitStudio)
  useEffect(() => {
    // If there's no task ID to poll, or if we already have a result, do nothing.
    if (!taskId || tryOnResult) {
      if (!taskId && !tryOnResult) console.log("useEffect (Polling): No taskId and no tryOnResult, not polling.");
      else if (!taskId) console.log("useEffect (Polling): No taskId, not polling.");
      else if (tryOnResult) console.log("useEffect (Polling): tryOnResult already available, not polling.");
      return; 
    }
    
    // if (!taskId) return; // This check is now covered by the more comprehensive one above

    console.log(`useEffect (Polling): taskId ${taskId} present, starting polling for bitStudio result.`);
    const interval = setInterval(async () => {
      console.log(`useEffect (Polling): Polling for taskId: ${taskId}`);
      try {
        const response = await fetch(`/api/try-on-callback?taskId=${taskId}`);
        // No need to check response.ok here as the callback route.js should return structured error for non-200 from bitStudio itself
        const data = await response.json();
        console.log("useEffect (Polling): Polling response data: ", JSON.stringify(data, null, 2));
        
        setTaskStatus(data.status || "polling..."); // Update with bitStudio status ('pending', 'generating', 'completed', 'failed')

        if (data.status === "completed" && data.result) {
          console.log(`useEffect (Polling): Task ${taskId} completed. Result URL: ${data.result}`);
          setTryOnResult(data.result);
          setIsProcessing(false);
          setTaskStatus("Completed");
          setShowSurveyModal(true); // Show survey modal on completion
          
          await emailConfirmation(data.result);
          clearInterval(interval); 

          if (isAuthenticated && userId && triedOnProduct) {
            console.log(`useEffect (Polling): Task ${taskId} completed, saving look for user ${userId} and product ${triedOnProduct.id}`);
            const savedLook = {
              userId: userId,
              productId: triedOnProduct.id,
              photoUrl: data.result, // This is the generated image URL
            };
            const { data: savedLookResult, errors } = await client.models.TryOnInstance.create(savedLook);
            if (errors) {
              console.error("useEffect (Polling): Error saving look:", errors);
            } else {
              console.log("useEffect (Polling): Look saved successfully:", savedLookResult);
            }
          }
        } else if (data.status === "failed") {
          console.error(`useEffect (Polling): Task ${taskId} failed. Error: ${data.error}, Details: ${JSON.stringify(data.details)}`);
          setIsProcessing(false);
          setTaskStatus("Failed");
          alert(`Image generation failed: ${data.error || 'Unknown error'}`);
          clearInterval(interval);
        } else if (data.error && response.status !== 200) { // e.g. task not found from our callback api, or other errors
            console.error(`useEffect (Polling): Error polling task ${taskId}. Message: ${data.error}. Status from our API: ${response.status}`);
            // Potentially stop polling if it's a persistent error like 404 from our side after many retries
            // For now, it will continue polling as per original logic if status is not 'completed' or 'failed'
        } else {
             console.log(`useEffect (Polling): Task ${taskId} status: ${data.status}. Continuing to poll.`);
        }
      } catch (error) {
        console.error(`useEffect (Polling): Error during polling for taskId ${taskId}:`, error);
        // Potentially stop polling on certain types of catch errors
      }
    }, 5000); // Poll every 5 seconds
  
    return () => {
        console.log(`useEffect (Polling): Cleaning up polling interval for taskId: ${taskId}`);
        clearInterval(interval);
    };
  }, [taskId, tryOnResult, isAuthenticated, userId, triedOnProduct]); // Added dependencies

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

  const surveyOptions = {
    confidence: ["Yes", "Somewhat", "Not really"],
    likelihoodReturn: ["Less likely", "Same", "More likely"],
    likelihoodBuy: ["Definitely", "Maybe", "No"],
  };

  const handleSurveySubmit = async (triedOnProductId: string) => {
    setIsSubmittingSurvey(true);
    console.log("Survey Submitted:");
    console.log("Confidence:", surveyConfidence);
    console.log("Likelihood to Return:", surveyLikelihoodReturn);
    console.log("Likelihood to Buy:", surveyLikelihoodBuy);

    // get the tryOnInstanceId from the triedOnProductId
    const {data: tryOnInstance, errors: tryOnInstanceErrors} = await client.models.TryOnInstance.list({
      filter: {
        productId: {eq: triedOnProductId}
      }
    });
    if (tryOnInstanceErrors) {
      console.error("Error fetching tryOnInstance:", tryOnInstanceErrors);
    }
    const tryOnInstanceId = tryOnInstance[0].id;

    const {data: updatedTryOnInstance, errors} = await client.models.TryOnInstance.update({
      id: tryOnInstanceId,
      purchaseConfidence: surveyConfidence === "Yes" ? "YES" : surveyConfidence === "Somewhat" ? "SOMEWHAT" : surveyConfidence === "Not really" ? "NO" : null,
      returnLikelihood: surveyLikelihoodReturn === "Less likely" ? "LESS_LIKELY" : surveyLikelihoodReturn === "Same" ? "SAME" : surveyLikelihoodReturn === "More likely" ? "MORE_LIKELY" : null,
      conversionBoost: surveyLikelihoodBuy === "Definitely" ? "DEFINITELY" : surveyLikelihoodBuy === "Maybe" ? "MAYBE" : surveyLikelihoodBuy === "No" ? "NO" : null,
    });
    if (errors) {
      console.error("Error updating tryOnInstance:", errors);
    }
    console.log("Updated tryOnInstance:", updatedTryOnInstance);
    setShowSurveyModal(false);
    setIsSubmittingSurvey(false);
  };

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
                  {!uploadedImage && <div className={`bg-[var(--jet)] text-white font-sans px-6 py-2 rounded-full w-full flex items-center justify-center gap-2 mouse-pointer whitespace-nowrap text-sm min-w-0 ${isUploadingNewUserImage ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <span className="text-md">↑</span> 
                    {isUploadingNewUserImage ? "Uploading..." : "Upload"}
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
                          className={`relative aspect-square cursor-pointer hover:opacity-90 transition border-2 ${activeUserImageS3Url === photo.url ? "border-[var(--coral)]" : "border-transparent"}`}
                          onClick={async () => {
                            console.log("Saved image clicked. URL:", photo.url, "ID:", photo.id);
                            setActiveUserImageS3Url(photo.url); // Set S3 URL for API
                            try {
                              // For local preview, still convert to base64 if needed by Image component
                              // or if direct S3 URL display is not preferred/performant for quick preview.
                              console.log("Setting uploadedImage preview from saved S3 URL:", photo.url);
                              const base64Image = await getBase64Url(photo.url); // Used for local preview
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
                            console.log("Example image clicked. Path:", `/GoodEx${num}.png`);
                            // Example images are local, convert to base64 for preview
                            // These won't have an S3 URL unless explicitly uploaded by the user later
                            setActiveUserImageS3Url(null); // Clear S3 URL if an example is chosen
                            try {
                              const base64Image = await getLocalBase64Url(`/GoodEx${num}.png`);
                              setUploadedImage(base64Image);
                              console.log("Example image set for preview.");
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

            {/* Try-on section - Reverted to simpler structure with new loading indicators */}
            <div className="flex flex-col flex-1 mb-4 p-5 bg-[var(--bone)] rounded-xl items-center max-h-[800px] min-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-sans font-bold mb-5">Try-On</h2>
              {isProcessing ? (
                // New Loading State UI
                <div className="flex flex-col items-center justify-center text-center w-full mt-20">
                  <h2 className="text-xl text-[var(--jet)] mb-3 font-sans">Creating Your Look...</h2>
                  <p className="text-[var(--taupe)] font-sans mb-2">
                    Status: <span className="font-bold">{taskStatus || "Initializing..."}</span>
                  </p>
                  {estimatedCompletionTime && taskStatus !== "Completed" && taskStatus !== "Failed" && (
                      <p className="text-sm text-[var(--jet)] font-sans mb-4">
                          Estimated completion: {new Date(estimatedCompletionTime).toLocaleTimeString()}
                      </p>
                  )}
                  {taskStatus === "generating" && <p className="text-sm text-[var(--jet)] font-sans mb-4">This might take a few moments.</p>}
                  <div className="w-full max-w-xs bg-[var(--linene)] rounded-full h-2.5 mt-4">
                     <div className="bg-[var(--taupe)] h-2.5 rounded-full animate-pulse" style={{width: taskStatus === "completed" || taskStatus === "Failed" ? "100%" : (taskStatus === "generating" ? "66%" : "33%")}}></div>
                  </div>
                </div>
              ) : tryOnResult ? (
                // Result Display UI (as per old structure)
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
                  {/* Button to clear/start new try-on was here - REMOVED */}
                </div>
              ) : taskStatus === "Failed" || taskStatus === "Error" ? (
                // Failure State UI (as per old structure, but without specific button for reset)
                <p className="text-center font-sans text-red-600 mt-20">Try-on failed, please try again.</p>
              ) : (
                // Initial/Placeholder UI (as per old structure)
                <p className="text-center font-sans text-[var(--taupe)] mt-20">No result to show yet. Upload your image and select a garment!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Survey Modal */}
      { showSurveyModal && tryOnResult && triedOnProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setShowSurveyModal(false)}></div>
          {/* Modal Content */}
          <div className="relative bg-[var(--bone)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
            {/* Close button for the modal */}
            <button 
                onClick={() => setShowSurveyModal(false)}
                className="absolute top-3 right-3 text-[var(--bone)] bg-[var(--taupe)] rounded-full p-1.5 z-10 hover:bg-opacity-80"
                aria-label="Close survey"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Left Column: Try-On Image */}
            <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-[var(--linen)] rounded-l-xl">
              <h3 className="text-lg font-semibold text-[var(--jet)] mb-3 text-center">Your Try-On Result</h3>
              <Image 
                src={tryOnResult || ""} 
                alt="Try-On Result for Survey" 
                width={300} 
                height={400} 
                className="rounded-lg object-contain shadow-lg border-2 border-[var(--taupe)]"
              />
              {/* <p className="text-md text-[var(--jet)] mt-2 font-sans text-center">You tried on: <span className="font-semibold">{triedOnProduct.name}</span></p> */}
            </div>

            {/* Right Column: Survey Questions */}
            <div className="w-full md:w-1/2 p-6 flex flex-col items-start">
              <div className="flex gap-2 mb-2">
                <Sprout className="h-8 w-8 text-[var(--coral)]" />
                <h2 className="text-3xl text-[var(--jet)]">Help Fitly Grow</h2>
              </div>
              <p className="text-sm text-[var(--taupe)] font-sans mb-6">So we can bring better try-ons to more stores!</p>

              {/* Question 1 */}
              <div className="mb-5">
                <p className="text-md font-semibold text-[var(--jet)] mb-2 font-sans">1. Feel more confident buying?</p>
                <div className="flex flex-row flex-wrap gap-2 w-full">
                  {surveyOptions.confidence.map(option => (
                    <label
                      key={option}
                      className={`
                        w-1/4 min-w-[100px] max-w-[200px]
                        flex items-center justify-center text-center gap-2 p-3 rounded-lg cursor-pointer transition
                        ${surveyConfidence === option 
                          ? 'bg-[var(--taupe)] text-white shadow-md border-0' 
                          : 'bg-white/50 hover:bg-[var(--taupe)]/20 border border-[var(--taupe)]/30 text-[var(--jet)]'}
                      `}
                      style={{boxSizing: 'border-box'}}
                    >
                      <input
                        type="radio"
                        name="surveyConfidence"
                        value={option}
                        checked={surveyConfidence === option}
                        onChange={(e) => setSurveyConfidence(e.target.value)}
                        className="opacity-0 w-0 h-0 fixed"
                      />
                      <span className="text-sm font-sans select-none">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="mb-5">
                <p className="text-md font-semibold text-[var(--jet)] mb-2 font-sans">2. Less likely to return it?</p>
                <div className="flex flex-row flex-wrap gap-2 w-full">
                  {surveyOptions.likelihoodReturn.map(option => (
                    <label
                      key={option}
                      className={`
                        w-1/4 min-w-[100px] max-w-[200px]
                        flex items-center justify-center text-center gap-2 p-3 rounded-lg cursor-pointer transition
                        ${surveyLikelihoodReturn === option 
                          ? 'bg-[var(--taupe)] text-white shadow-md border-0' 
                          : 'bg-white/50 hover:bg-[var(--taupe)]/20 border border-[var(--taupe)]/30 text-[var(--jet)]'}
                      `}
                      style={{boxSizing: 'border-box'}}
                    >
                      <input
                        type="radio"
                        name="surveyLikelihoodReturn"
                        value={option}
                        checked={surveyLikelihoodReturn === option}
                        onChange={(e) => setSurveyLikelihoodReturn(e.target.value)}
                        className="opacity-0 w-0 h-0 fixed"
                      />
                      <span className="text-sm font-sans select-none">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div className="mb-6">
                <p className="text-md font-semibold text-[var(--jet)] mb-2 font-sans">3. More likely to buy it?</p>
                <div className="flex flex-row flex-wrap gap-2 w-full">
                  {surveyOptions.likelihoodBuy.map(option => (
                    <label
                      key={option}
                      className={`
                        w-1/4 min-w-[100px] max-w-[200px]
                        flex items-center justify-center text-center gap-2 p-3 rounded-lg cursor-pointer transition
                        ${surveyLikelihoodBuy === option 
                          ? 'bg-[var(--taupe)] text-white shadow-md border-0' 
                          : 'bg-white/50 hover:bg-[var(--taupe)]/20 border border-[var(--taupe)]/30 text-[var(--jet)]'}
                      `}
                      style={{boxSizing: 'border-box'}}
                    >
                      <input
                        type="radio"
                        name="surveyLikelihoodBuy"
                        value={option}
                        checked={surveyLikelihoodBuy === option}
                        onChange={(e) => setSurveyLikelihoodBuy(e.target.value)}
                        className="opacity-0 w-0 h-0 fixed"
                      />
                      <span className="text-sm font-sans select-none">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleSurveySubmit(triedOnProduct.id)}
                className={`w-full bg-[var(--taupe)] font-sans text-white py-1.5 px-4 rounded-full text-sm hover:bg-opacity-85 transition mt-auto ${!(surveyConfidence && surveyLikelihoodReturn && surveyLikelihoodBuy) ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!surveyConfidence || !surveyLikelihoodReturn || !surveyLikelihoodBuy || isSubmittingSurvey}
              >
                {isSubmittingSurvey ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}