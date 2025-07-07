"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  storageBucket: "fitly-3f935.firebasestorage.app",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

//Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default function UploadPage() {
  const params = useParams();
  const uid = params.uid as string;
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log the UID from URL on component mount
  useEffect(() => {
    console.log("Current UID from URL:", uid);
    console.log("Firebase Storage initialized with bucket:", firebaseConfig.storageBucket);
  }, [uid]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("File selected:", `${file.name} (${file.type}, ${file.size} bytes)`);
    
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type);
      setError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error("File too large:", file.size, "bytes");
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    // Immediately start upload
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!uid) {
      console.error("Cannot upload: missing UID");
      setError("Missing user ID. Please check your link and try again.");
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      console.log(`Starting upload for user ${uid}...`);
      
      // Create a reference to the file in Firebase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
      const filePath = `images/${uid}/${fileName}`;
      console.log("Upload destination path:", filePath);
      
      const storageRef = ref(storage, filePath);
      
      // Upload the file
      console.log("Uploading file to Firebase Storage...");
      const uploadResult = await uploadBytes(storageRef, file);
      console.log("Upload successful:", uploadResult);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("File available at:", downloadURL);
      
      setUploadSuccess(true);
      console.log("Upload process completed successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow flex flex-col p-4 mx-auto w-full h-full justify-center items-center bg-[#ededed]">
        {!isUploading && !uploadSuccess && !error ? (
          <div className="bg-white rounded-2xl shadow px-10 py-10 w-90 h-full flex flex-col justify-center items-center">
            <h1 className="text-xl text-center text-gray-800 mb-8">Upload a photo of yourself</h1>
            {/* Guidelines */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-3">Full body</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-3">Good lighting</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-3">Just you</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-3">Simple standing pose</span>
              </li>
            </ul>
            
            {/* Upload Button */}
            <label className="block w-full">
              <div className="bg-[#2b2b2b] hover:bg-opacity-90 text-white py-3 px-4 rounded-full font-medium text-center cursor-pointer transition-colors">
                Upload Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </div>
            </label>
          </div>
        ) : isUploading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center flex-grow flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4">
              <div className="w-full h-full border-4 border-t-[#f44d14] border-gray-200 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Uploading...</h2>
            <p className="text-gray-600">
              Please wait while we upload your photo.
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow px-10 py-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Upload Failed</h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="px-9 py-3 bg-[#2b2b2b] text-white rounded-full hover:bg-opacity-90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : uploadSuccess && (
          <div className="bg-white rounded-2xl shadow px-10 py-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-4">Upload Successful!</h2>
            <h3 className="font-medium text-[#2b2b2b] mb-2">Close and re-open the extension to see your new photo!</h3>
          </div>
        )}
      </main>
      
      <footer className="py-4 px-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Fitly
      </footer>
    </div>
  );
} 