"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Demo() {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedAccess = localStorage.getItem("fitly_demo_access");
    if (storedAccess === "true") {
      setHasAccess(true); // Fixed the logic here (was setting to false)
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // On mobile: only allow numbers, on desktop: allow alphanumeric
    const isMobile = window.innerWidth < 768;
    const pattern = isMobile ? /^[0-9]?$/ : /^[A-Za-z0-9]?$/;
    if (!pattern.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).toUpperCase();
    setCode(pastedData.split(""));
    inputRefs.current[pastedData.length - 1]?.focus();
  };

  const handleSubmit = () => {
    const enteredCode = code.join("");
    setError("");
    if (enteredCode === "123456") {
      setHasAccess(true);
      localStorage.setItem("fitly_demo_access", "true");
    } else {
      setError("Invalid Access Code");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row justify-center">
      {!hasAccess ? (
        <>
          {/* Left side - hidden on mobile */}
          <div className="hidden md:flex md:flex-1 bg-[var(--taupe)] items-center justify-center px-10 rounded-br-[60px]">
            <Image src="/logo_light.png" alt="FITLY" width={250} height={500} />
          </div>

          {/* Right side - centered on mobile */}
          <div className="w-full md:flex-1 flex flex-col justify-center items-center md:items-start px-4 md:px-20 py-8">
            <h2 className="text-[var(--jet)] text-4xl md:text-6xl">Access Code</h2>
            <p className="text-[var(--jet)] text-sm mb-6 font-sans text-center">
              Don't have a code?{" "}
              <span className="underline">Contact sreenand6@gmail.com for one</span>
            </p>
            <div className="flex space-x-3 mb-6 w-full max-w-md justify-center">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={code[index]}
                  ref={(el: HTMLInputElement | null) => {inputRefs.current[index] = el}}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 md:w-16 md:h-20 border-2 border-[#3C2F26] text-center text-xl md:text-3xl rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)]"
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              className="bg-[var(--taupe)] w-full max-w-xs md:w-2/3 text-white px-6 py-2 md:py-1 rounded-full text-lg md:text-xl hover:bg-[#4A362A] transition"
              onClick={handleSubmit}
            >
              Continue
            </button>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 text-sm font-sans mt-4">{error}</p>
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <h1 className="text-4xl text-[var(--jet)]">Access Granted</h1>
        </div>
      )}
    </div>
  );
}