"use client"
import Image from "next/image";

export default function HowItWorks() {
    return (
        <div className="flex flex-col items-center w-full h-240 md:h-100 px-6 py-10 bg-[var(--taupe)]">
            <h1 className="text-5xl md:text-6xl text-[var(--linen)] mb-10">How it works</h1>
            <div className="flex flex-col md:flex-row w-full max-w-4xl gap-20 md:gap-0">
               {/* Step 1 */}
                <div className="w-full lg:w-1/4 h-32 lg:h-full flex flex-col items-center justify-center text-center">
                    <Image 
                        src="/step1.png" 
                        alt="upload"
                        width={150} 
                        height={120} 
                        className="" 
                    />
                    <h1 className="text-xl lg:text-2xl text-[var(--linen)]">Step one</h1>
                    <p className="text-sm lg:text-md text-[var(--linen)] font-sans">Upload pictures of yourself</p>
                </div>
                {/* Step 2 */}
                <div className="w-full lg:w-1/4 h-32 lg:h-full flex flex-col items-center justify-center text-center">
                    <Image 
                        src="/step2.png" 
                        alt="upload"
                        width={150} 
                        height={120} 
                        className="" 
                    />
                    <h1 className="text-xl lg:text-2xl text-[var(--linen)]">Step two</h1>
                    <p className="text-sm lg:text-md text-[var(--linen)] font-sans">Choose your outfits</p>
                </div>
                {/* Step 3 */}
                <div className="w-full lg:w-1/4 h-32 lg:h-full flex flex-col items-center justify-center text-center">
                    <Image 
                        src="/step3.png" 
                        alt="upload"
                        width={150} 
                        height={120} 
                        className="" 
                    />
                    <h1 className="text-xl lg:text-2xl text-[var(--linen)]">Step three</h1>
                    <p className="text-sm lg:text-md text-[var(--linen)] font-sans">See it on you!</p>
                </div>
                {/* Step 4 */}
                <div className="w-full lg:w-1/4 h-32 lg:h-full flex flex-col items-center justify-center text-center">
                    <Image 
                        src="/step4.png" 
                        alt="upload"
                        width={150} 
                        height={120} 
                        className="" 
                    />
                    <h1 className="text-xl lg:text-2xl text-[var(--linen)]">Step four</h1>
                    <p className="text-sm lg:text-md text-[var(--linen)] font-sans">Shop with confidence!</p>
                </div>
            </div>
        </div>
    );
}
