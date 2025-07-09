"use client";

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow p-4 md:p-8 mx-auto w-full max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy for Fitly</h1>
          <p className="text-gray-600 mb-6">Effective Date: [07/08/2025]</p>

          <p className="mb-6">
            At Fitly, we care deeply about your privacy. This Privacy Policy explains how we collect, use, and protect your data when you use our Chrome extension.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. What We Collect</h2>
          <p className="mb-4">When you use Fitly, we may collect and store the following information:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Your name, and email(handled through Firebase Authentication)</li>
            <li>A full-body photo uploaded by you for generating virtual try-on results</li>
            <li>Body measurements (e.g., height, chest, waist), estimated from temporary profile photos (which are not stored in the cloud, only locally on your device)</li>
            <li>Try-on result images and related metadata</li>
            <li>Product image URLs from the pages you interact with</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Data</h2>
          <p className="mb-4">We use your data to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Generate personalized virtual try-ons</li>
            <li>Improve your shopping experience by storing try-on history</li>
            <li>Authenticate your identity and save your preferences</li>
            <li>Communicate with our try-on processing partner (BitStudio)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Third-Party Services</h2>
          <p className="mb-6">
            We share your uploaded images with our processing partner BitStudio, which generates your try-on previews. 
            BitStudio may process and temporarily store your image to fulfill your request. Please refer to their Privacy Policy for more information.
          </p>
          <p className="mb-6">
            We do not sell your data or use third-party analytics.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage & Retention</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Your try-on results and measurement data are stored securely in Firebase.</li>
            <li>Temporary profile images (used for body measurement) are not stored.</li>
            <li>Data stored locally on your device (via Chrome storage) is used to speed up your experience.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Security</h2>
          <p className="mb-6">
            We use secure protocols and Google's Firebase infrastructure to protect your personal data. 
            However, no system is 100% secure — use Fitly at your own discretion.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Consent</h2>
          <p className="mb-6">
            By using Fitly, you agree to this Privacy Policy and the handling of your data as described above.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact</h2>
          <p className="mb-6">
            If you have questions or requests regarding your data, please contact us at sreenand6@gmail.com.
          </p>
        </div>
      </main>
      
      <footer className="py-4 px-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Fitly
      </footer>
    </div>
  );
} 