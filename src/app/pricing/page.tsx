"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadRedirectPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-[#ededed] rounded-2xl shadow px-10 py-6 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold mb-4">Invalid Access</h1>
        <p className="text-gray-600">
          Access pricing page through the extension
        </p>
      </div>
    </div>
  );
} 