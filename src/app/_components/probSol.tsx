"use client";
import Image from "next/image";

export default function ProbSol() {
    return (
        <div className="flex flex-col items-center w-full min-h-fit bg-[var(--linen)] py-5">
            
            {/* Problem Section */}
            <div className="flex flex-col md:flex-row items-center w-full max-w-5xl px-10 md:px-20 gap-8">
                
                {/* Text Content */}
                <div className="flex-3 text-center md:text-left p-4">
                    <h1 className="text-4xl md:text-5xl text-[var(--jet)] mb-4">Problem</h1>
                    <Image 
                        src="/prob.png" 
                        alt="problem"
                        width={120} 
                        height={400} 
                        className="md:hidden mx-auto" 
                    />
                    <p className="text-lg lg:text-xl text-[var(--jet)] font-sans mt-4">
                        Online apparel shopping has a <b>24.4% return rate</b>, costing retailers 
                        <b> $38 billion</b> annually and contributing to 
                        <b> 15M+ metric tons</b> of CO₂ emissions!
                    </p>
                </div>

                {/* Image for Larger Screens */}
                <div className="hidden md:block flex-1">
                    <Image 
                        src="/prob.png" 
                        alt="problem"
                        width={250} 
                        height={400} 
                        className="mx-auto" 
                    />
                </div>
            </div>

            {/* Solution Section */}
            <div className="flex flex-col md:flex-row-reverse items-center w-full max-w-5xl px-10 md:px-20 mt-10 gap-8">
                
                {/* Text Content */}
                <div className="flex-3 text-center md:text-right p-4">
                    <h1 className="text-4xl md:text-5xl text-[var(--jet)] mb-4">Solution</h1>
                    <Image 
                        src="/sol.png" 
                        alt="solution"
                        width={150} 
                        height={400} 
                        className="md:hidden mx-auto" 
                    />
                    <p className="text-lg lg:text-xl text-[var(--jet)] font-sans mt-4">
                        <b>Fit+ly</b> aims to revolutionize online shopping with 
                        <b> AI-powered Virtual Try-On Technology.</b> 
                        Our platform creates photorealistic try-on images, allowing users to 
                        confidently choose the right size and style—<b>reducing returns, 
                        cutting costs, and making fashion more sustainable!</b>
                    </p>
                </div>

                {/* Image for Larger Screens */}
                <div className="hidden md:block flex-1">
                    <Image 
                        src="/sol.png" 
                        alt="solution"
                        width={300} 
                        height={400} 
                        className="mx-auto" 
                    />
                </div>
            </div>

        </div>
    );
}
