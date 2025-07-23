'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";


export default function Pricing() {
  const params = useParams();
  const uid = params.uid as string;

  // Log the UID from URL on component mount
  useEffect(() => {
    console.log("Current UID from URL:", uid);
  }, [uid]);

  useEffect(() => {
    // Load Stripe Pricing Table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const stripeTableHtml = `
    <stripe-pricing-table
      pricing-table-id="prctbl_1Rnn1oGDHeBJiM6RInzipQCY"
      publishable-key="pk_live_51RhORFGDHeBJiM6Rb12h6uWNHOyzpGyfZOoRd0XhJsWtMEVKx5m2CC2S1MnlVjWOHH5oLUn2OS19Zhi9oPNn3CqM00qcu01JwG"
      client-reference-id="${uid}"
    ></stripe-pricing-table>
  `;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl mb-8 text-center">Pricing Plans</h1>
      <div 
        className="w-full mx-auto py-12 bg-[#ededed] rounded-lg shadow-md"
        dangerouslySetInnerHTML={{ __html: stripeTableHtml }}
      />
    </div>
  );
} 