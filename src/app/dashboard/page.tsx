"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Shirt, Pencil, User, ArrowRight, Upload } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setFirstName(attributes.given_name || "");
      } catch {
        router.replace("/auth");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-[var(--linen)] flex flex-col pt-30 px-2 md:px-0 mb-60">
      {/* Welcome message at the top */}
      <div className="max-w-7xl mx-auto w-full flex flex-col px-4 sm:px-6 md:px-8 lg:px-10">
        <h1 className="text-4xl md:text-5xl text-[var(--jet)] mb-1">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
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
            <Link href="/size-estimation" className="bg-[var(--taupe)] text-white py-2 px-4 rounded-full text-base w-fit hover:bg-opacity-80 font-sans flex items-center gap-2">
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
            <Link href="/profile" className="border-1 border-[var(--taupe)] text-[var(--jet)] py-2 px-4 rounded-full text-base w-fit hover:bg-opacity-80 font-sans flex items-center gap-2">
              Edit profile 
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* Right column */}
        <div className="flex flex-col gap-6 w-full md:w-2/3">
          {/* Saved Images */}
          <div className="flex-1 rounded-2xl bg-[var(--bone)] p-6 flex flex-col gap-2 shadow-md min-h-[160px]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg font-sans">Your Saved Images</span>
              <button className="border border-[var(--taupe)] rounded-full px-4 py-1 text-[var(--taupe)] hover:bg-[var(--taupe)] hover:text-white transition text-base font-sans flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
            {/* Placeholder for images */}
          </div>
          {/* Recent Try-ons */}
          <div className="flex-1 rounded-2xl bg-[var(--bone)] p-6 flex flex-col gap-2 shadow-md min-h-[160px]">
            <span className="font-bold text-lg font-sans">Recent Try-ons</span>
            {/* Placeholder for try-ons */}
          </div>
        </div>
      </div>
    </div>
  );
} 