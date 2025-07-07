"use client";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          background: "linear-gradient(to bottom, #e4d8d1, #f44d14)",
          height: "100%" 
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-24 px-4 md:px-8">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-center text-[#2b2b2b]">
          Your Virtual Fitting Room
        </h1>
        
        {/* Subheading */}
        <p className="mt-4 text-lg md:text-xl text-center text-[#2b2b2b] max-w-2xl">
          All in one - <br />
          integrated right into chrome
        </p>

        <button className="flex items-center gap-2 bg-white/30 backdrop-blur-md px-14 py-2 rounded-full hover:bg-white/50 transition-colors mt-8">
            <span>Coming Soon</span>
        </button>
        
        {/* Hanger Graphic */}
        <div className="mt-8 md:mt-5">
          <Image
            src="/hangerGraphic.png"
            alt="Hanger Graphic"
            width={400}
            height={300}
            className="w-64 md:w-80 lg:w-96 z-10"
          />
        </div>
      </div>
    </div>
  );
}
