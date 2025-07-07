'use client';

import { useEffect } from 'react';

export default function PricingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-3xl mb-4">Something went wrong</h1>
      <p className="mb-6">We couldn't load the pricing information at this time.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
} 