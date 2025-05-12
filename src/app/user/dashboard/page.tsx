"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../amplify/data/resource';
import Image from "next/image";
import Link from "next/link";
import { Shirt, Pencil, User, ArrowRight, Upload, X } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const client = generateClient<Schema>();

export default function DashboardPage() {
  const router = useRouter();
  const [savedImages, setSavedImages] = useState<{ url: string; id: string }[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [showExamples, setShowExamples] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [tryOnInstances, setTryOnInstances] = useState<{ id: string; productId: string; photoUrl: string; product?: any }[]>([]);  

  // Separate useEffect for authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();
        setUserId(user.userId);
        setUserName(userAttributes.given_name || "");
      } catch {
        router.push('/auth');
      }
    };
    checkAuth();
  }, [router]);

  // Fetch saved photos when userId changes
  useEffect(() => {
    if (userId) {
      fetchSavedPhotos();
      fetchTryOnInstances();
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

  const fetchTryOnInstances = async () => {
    try {
      const { data: tryOnInstances, errors } = await client.models.TryOnInstance.list({
        filter: { userId: { eq: userId } }
      });

      if (errors) {
        console.error('Errors fetching try-on instances:', errors);
        return;
      }

      // Fetch product details for each instance
      const instancesWithProduct = await Promise.all(
        tryOnInstances.map(async (instance) => {
          const { data: product } = await client.models.Product.get({ id: instance.productId });
          return { ...instance, product, photoUrl: instance.photoUrl };
        })
      );
      setTryOnInstances(instancesWithProduct);
    } catch (error) {
      console.error('Error fetching try-on instances:', error);
    }
  };

  useEffect(() => {
    if (tryOnInstances.length > 0) {
      console.log('Try-on instances:', tryOnInstances);
    }
  }, [tryOnInstances]);

  const handleUploadSuccess = async (url: string) => {
    try {
      console.log('Creating UserPhoto record for URL:', url);
      const result = await client.models.UserPhoto.create({
        userId: userId,
        type: 'SAVED',
        photoUrl: url
      });
      console.log('UserPhoto created successfully:', result);
      // Refresh the photos list
      await fetchSavedPhotos();
      setShowUploader(false);
    } catch (error) {
      console.error('Error creating UserPhoto:', error);
    }
  };

  const handleDelete = async (photo: { url: string; id: string }) => {
    try {
      // Extract the path from the URL
      const path = photo.url.split('/').pop();
      if (!path) return;

      // Delete from S3
      await remove({ path: `saved-photos/${path}` });
      console.log('Photo deleted from S3');
      
      // Delete from DynamoDB using the stored ID
      const result = await client.models.UserPhoto.delete({ id: photo.id });
      console.log('Photo deleted from DynamoDB', result);
      
      // Refresh the photos list
      await fetchSavedPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--linen)] flex flex-col pt-30 px-2 md:px-0 mb-60">
      {/* Welcome message at the top */}
      <div className="max-w-7xl mx-auto w-full flex flex-col px-4 sm:px-6 md:px-8 lg:px-10">
        <h1 className="text-4xl md:text-5xl text-[var(--jet)] mb-1">Welcome back, {userName}</h1>
        <p className="text-md text-[var(--jet)] font-sans">Manage your try-ons, saved images, and profile here.</p>
        <hr className="w-full mt-4 border-1 border-[var(--taupe)]" />
      </div>
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:flex-row md:gap-8 mt-10 px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Left column */}
        <div className="flex flex-col gap-6 w-full md:w-1/3">
          {/* Card 1 */}
          <div className="rounded-2xl bg-[var(--bone)] p-6 flex flex-col gap-2 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Shirt className="h-6 w-6 text-[var(--taupe)]" />
              <span className="font-bold text-lg font-sans">Explore Our Latest Collections</span>
            </div>
            <p className="text-sm font-sans mb-2">Try on new styles virtually and find your perfect fit with our AI-powered fitting room</p>
            <Link href="/fittingroom" className="bg-[var(--taupe)] text-white py-2 px-4 rounded-full text-base w-fit hover:bg-opacity-80 font-sans flex items-center gap-2">
              Go to fitting room 
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Card 2 */}
          <div className="rounded-2xl bg-[var(--bone)] p-6 flex flex-col gap-2 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Pencil className="h-6 w-6 text-[var(--taupe)]" />
              <span className="font-bold text-lg font-sans">Let's Estimate Your Size</span>
            </div>
            <p className="text-sm font-sans mb-2">Upload front, back and side pictures to get an instant size estimate</p>
            <Link href="/user/size-estimation" className="bg-[var(--taupe)] text-white py-2 px-4 rounded-full text-base w-fit hover:bg-opacity-80 font-sans flex items-center gap-2">
              Estimate now 
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Card 3 */}
          <div className="rounded-2xl bg-[var(--bone)] p-6 flex flex-col gap-2 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-6 w-6 text-[var(--taupe)]" />
              <span className="font-bold text-lg font-sans">Manage Your Profile</span>
            </div>
            <p className="text-sm font-sans mb-2">Upload front, back and side pictures to get an instant size estimate</p>
            <Link href="/user/profile" className="border-1 border-[var(--taupe)] text-[var(--jet)] py-2 px-4 rounded-full text-base w-fit hover:bg-opacity-80 font-sans flex items-center gap-2">
              Edit profile 
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* Right column */}
        <div className="flex flex-col gap-6 w-full md:w-2/3">
          {/* Recent Try-ons */}
          <div className="flex-1 rounded-2xl bg-[var(--bone)] p-6 flex flex-col gap-2 shadow-md min-h-[160px]">
            <span className="font-bold text-lg font-sans">Recent Try-ons</span>
            <div className="flex flex-row gap-6 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-[var(--taupe)] scrollbar-track-[var(--bone)]">
              {tryOnInstances.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[160px] text-[var(--taupe)] font-sans text-sm">No try-ons yet</div>
              ) : (
                tryOnInstances.map((instance) => (
                  <div className="flex flex-col min-w-[220px] max-w-[220px] bg-[var(--jet)] rounded-xl shadow-md overflow-hidden">
                    <div className="w-full aspect-[3/4] bg-[var(--linen)]">
                      <img
                        src={instance.photoUrl}
                        alt="Try-On Result"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {instance.product && (
                      <div className="bg-[var(--taupe)]/90 px-4 py-3 flex flex-row justify-between w-full">
                        <div className="flex flex-col items-start">
                          <span className="text-base text-white font-sans">{instance.product.name}</span>
                          <span className="text-xs text-white font-sans mb-1 line-clamp-3">{instance.product.description}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-[var(--linen)] font-sans">${instance.product.price}</span>
                          <span className="text-xs text-[var(--linen)] font-sans mb-1 line-clamp-3">{instance.product.gender === "MALE" ? "Men's" : instance.product.gender === "FEMALE" ? "Women's" : "Unisex"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Saved Images */}
          <div className="rounded-2xl bg-[var(--bone)] p-6 flex flex-col gap-2 shadow-md min-h-[160px]">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg font-sans">Your Saved Images</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowExamples(true)}
                  className="border border-[var(--taupe)] rounded-full px-4 py-1 text-[var(--taupe)] hover:bg-[var(--taupe)] hover:text-white transition text-sm font-sans flex items-center gap-2"
                >
                  View Examples
                </button>
                <button 
                  onClick={() => setShowUploader(!showUploader)}
                  className="border border-[var(--taupe)] rounded-full px-4 py-1 text-[var(--taupe)] hover:bg-[var(--taupe)] hover:text-white transition text-sm font-sans flex items-center gap-2"
                >
                  <Upload className="h-4 w-4"/>
                  Upload
                </button>
              </div>
            </div>
            {showUploader && (
              <div className="mt-4">
                <ImageUploader onUploadSuccess={handleUploadSuccess} folder="saved-photos" />
              </div>
            )}
            {savedImages.length === 0 ? (
              <div className="flex flex-col gap-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-sans text-[var(--jet)] font-bold">Recommended:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm font-sans text-[var(--jet)]">
                      <div className="flex items-center gap-2"><li>Clear single-person photo</li><span className="text-green-500 font-bold">✓</span></div>
                      <div className="flex items-center gap-2"><li>Full body or half-body shot</li><span className="text-green-500 font-bold">✓</span></div>
                      <div className="flex items-center gap-2"><li>Unobstructed clothing on the model</li><span className="text-green-500 font-bold">✓</span></div>
                      <div className="flex items-center gap-2"><li>Simple pose</li><span className="text-green-500 font-bold">✓</span></div>
                      <div className="flex items-center gap-2"><li>Model wearing simple, fitted clothing</li><span className="text-green-500 font-bold">✓</span></div>
                      <div className="flex items-center gap-2"><li>Unobstructed model's face</li><span className="text-green-500 font-bold">✓</span></div>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-sans text-[var(--jet)] font-bold">Not Recommended:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm font-sans text-[var(--jet)]">
                      <div className="flex items-center gap-2"><li>Group photos</li></div>
                      <div className="flex items-center gap-2"><li>Leaning or seated poses</li></div>
                      <div className="flex items-center gap-2"><li>Obstructed clothing areas</li></div>
                      <div className="flex items-center gap-2"><li>Complex poses</li></div>
                      <div className="flex items-center gap-2"><li>No backpacks, handbags, etc.</li></div>
                      <div className="flex items-center gap-2"><li>Obstructed model's face</li></div>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {savedImages.map((photo, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={photo.url}
                      alt={`Saved photo ${index + 1}`}
                      className="w-full h-100 object-cover rounded-lg"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                    <button
                      onClick={() => handleDelete(photo)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Example Modal */}
      {showExamples && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowExamples(false)}></div>
          <div className="relative bg-[var(--bone)] rounded-2xl p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowExamples(false)}
              className="sticky top-0 float-right text-[var(--bone)] bg-[var(--taupe)] rounded-full p-1"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold font-sans mb-4">Example Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <p className="text-sm font-sans text-[var(--jet)] font-bold">Good Examples:</p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="aspect-[3/4] bg-[var(--linen)] rounded-lg border-2 border-green-500 overflow-hidden max-w-[200px] mx-auto">
                      <Image 
                        src="/GoodEx1.png" 
                        alt="Good example 1" 
                        width={200} 
                        height={267}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-sans text-[var(--jet)] text-center">✓ Clear solo photo with good lighting and simple background</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="aspect-[3/4] bg-[var(--linen)] rounded-lg border-2 border-green-500 overflow-hidden max-w-[200px] mx-auto">
                      <Image 
                        src="/GoodEx2.png" 
                        alt="Good example 2" 
                        width={200} 
                        height={267}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-sans text-[var(--jet)] text-center">✓ Full body shot with clear view of clothing and posture</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="aspect-[3/4] bg-[var(--linen)] rounded-lg border-2 border-green-500 overflow-hidden max-w-[200px] mx-auto">
                      <Image 
                        src="/GoodEx3.png" 
                        alt="Good example 3" 
                        width={200} 
                        height={267}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-sans text-[var(--jet)] text-center">✓ Simple standing pose with arms at sides</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm font-sans text-[var(--jet)] font-bold">Bad Examples:</p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="aspect-[3/4] bg-[var(--linen)] rounded-lg border-2 border-red-500 overflow-hidden max-w-[200px] mx-auto">
                      <Image 
                        src="/BadEx1.png" 
                        alt="Bad example 1" 
                        width={200} 
                        height={267}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-sans text-[var(--jet)] text-center">❌ Group photo makes it difficult to focus on individual clothing</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="aspect-[3/4] bg-[var(--linen)] rounded-lg border-2 border-red-500 overflow-hidden max-w-[200px] mx-auto">
                      <Image 
                        src="/BadEx2.png" 
                        alt="Bad example 2" 
                        width={200} 
                        height={267}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-sans text-[var(--jet)] text-center">❌ Seated pose and crossed legs obstruct clothing details</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="aspect-[3/4] bg-[var(--linen)] rounded-lg border-2 border-red-500 overflow-hidden max-w-[200px] mx-auto">
                      <Image 
                        src="/BadEx3.png" 
                        alt="Bad example 3" 
                        width={200} 
                        height={267}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-sans text-[var(--jet)] text-center">❌ Face obscured and baggy clothing hides body shape</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 