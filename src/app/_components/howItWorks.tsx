"use client"
import Image from "next/image";

export default function HowItWorks() {
    return (
        <div className="flex flex-col items-center w-full h-200 lg:h-100 px-6 py-10 bg-[var(--taupe)]">
            <h1 className="text-4xl lg:text-6xl text-[var(--linen)] mb-10">How it works</h1>
            <div className="flex flex-col lg:flex-row justify-center w-full max-w-4xl p-4 gap-4">
               {/* Step 1 */}
                <div className="w-full lg:w-1/4 h-32 lg:h-full flex flex-col items-center justify-center text-center px-4 mb-5 md:mb-0">
                    <Image 
                        src="/step1.png" 
                        alt="upload"
                        width={100} 
                        height={100} 
                        className="" 
                    />
                    <h1 className="text-xl lg:text-2xl text-[var(--linen)]">Step one</h1>
                    <p className="text-sm lg:text-md text-[var(--linen)] font-sans">Upload pictures of yourself</p>
                </div>
                {/* Step 2 */}
                <div className="w-full lg:w-1/4 h-32 lg:h-full flex flex-col items-center justify-center text-center p-4">
                    <Image 
                        src="/step2.png" 
                        alt="upload"
                        width={100} 
                        height={100} 
                        className="" 
                    />
                    <h1 className="text-xl lg:text-2xl text-[var(--linen)]">Step two</h1>
                    <p className="text-sm lg:text-md text-[var(--linen)] font-sans">Choose your outfits</p>
                </div>
                {/* Step 3 */}
                <div className="w-full lg:w-1/4 h-32 lg:h-full flex flex-col items-center justify-center text-center p-4">
                    <Image 
                        src="/step3.png" 
                        alt="upload"
                        width={100} 
                        height={100} 
                        className="" 
                    />
                    <h1 className="text-xl lg:text-2xl text-[var(--linen)]">Step three</h1>
                    <p className="text-sm lg:text-md text-[var(--linen)] font-sans">See it on you!</p>
                </div>
                {/* Step 4 */}
                <div className="w-full lg:w-1/4 h-32 lg:h-full flex flex-col items-center justify-center text-center p-4">
                    <Image 
                        src="/step4.png" 
                        alt="upload"
                        width={100} 
                        height={100} 
                        className="" 
                    />
                    <h1 className="text-xl lg:text-2xl text-[var(--linen)]">Step four</h1>
                    <p className="text-sm lg:text-md text-[var(--linen)] font-sans">Shop with confidence!</p>
                </div>
            </div>
        </div>
    );
}
