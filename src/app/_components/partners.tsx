"use client";
import Image from "next/image";

export default function Partners() {
    return (
        <div className="w-full min-h-fit flex flex-col md:flex-row items-center py-10 px-20 md:px-40 bg-[var(--taupe)] gap-8">
            {/* Text Content */}
            <div className="flex-3 text-center md:text-left p-4">
                <h1 className="text-4xl md:text-5xl text-[var(--linen)] mb-4">For Retailers and Partners</h1>
                <Image 
                    src="/partners.png" 
                    alt="handshake"
                    width={120} 
                    height={400} 
                    className="md:hidden mx-auto" 
                />
                <p className="text-lg lg:text-xl text-white font-sans mt-4">
                    Fit+ly partners with retailers to showcase their collections on our platform, offering unparalleled visibility and engagement. Additionally, our proprietary technology can be licensed for integration directly into retailers’ native websites via an API, empowering them to deliver the same transformative experience to their customers.
                </p>
                <div className="mt-6 inline-block bg-[var(--linen)] text-[var(--taupe)] py-2 px-6 rounded-full text-2xl hover:bg-opacity-80">
                    Contact us to learn more
                </div>
            </div>

            {/* Image for Larger Screens */}
            <div className="hidden md:block flex-1">
                <Image 
                    src="/partners.png" 
                    alt="problem"
                    width={250} 
                    height={400} 
                    className="mx-auto" 
                />
            </div>
        </div>
    );
}
