"use client";
import Image from "next/image";
import Link from "next/link";

export default function Thumbnail() {
    return (
    <div className="p-15">
        <Image src={'/stars.png'} alt="stars" objectFit="cover" layout="fill" className="hidden md:block mt-15"/>
        <section className="py-16 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between">
            {/* Left Side - Text Content */}
        <div className="max-w-lg text-center md:text-left">
            <h1 className="text-5xl md:text-6xl">
            Fashion made for you
            </h1>
            <p className="mt-4 text-lg text-[#5C3D2E] font-sans">
            Visualize how clothes fit your unique body. Simply click, try, and shop with confidence!
            </p>
            <Link
            href="#try-now"
            className="mt-6 inline-block bg-[var(--taupe)] text-white py-2 px-6 rounded-full text-2xl hover:bg-opacity-80"
            >
            Try now
            </Link>
        </div>

        {/* Right Side - Full Image */}
        <div className="w-full md:w-[40%] flex justify-center">
            <Image
            src="/hero-thumbnail.png" // Replace with your uploaded image filename
            alt="Hero Section Thumbnail"
            width={700}  // Adjust width as needed
            height={300} // Adjust height as needed
            className="mt-0 md:mt-6"
            />
        </div>
        
        </section>
    </div>
    )
}
