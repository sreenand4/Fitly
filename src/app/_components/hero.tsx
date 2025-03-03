"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; 

export default function Hero() {
    const images = [
        '/model1.png',
        '/model2.png',
        '/model3.png',
        '/model4.png',
        '/model5.png',
    ]
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    return (
    <div className="h-screen flex flex-col md:flex-row items-center justify-center mt-20 px-10 py-10 md:py-0 md:px-20">
        <div className="w-full md:w-2/5 h-1/5 md:h-full flex flex-col items-center justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-center">
                Fashion made for you
            </h1>
            <h3 className="mt-4 px-10 md:px-0 text-xl md:text-xl lg:text-2xl font-sans text-center">
                Visualize how clothes fit your unique body. Simply click, try, and shop with confidence!
            </h3>
            <Link href="#try-now" className="mt-6 hidden md:inline-block bg-[var(--taupe)] text-white py-2 px-6 rounded-full text-2xl hover:bg-opacity-80">
                Try now
            </Link>
        </div>
        <div className="w-full md:w-3/5 h-3/5 md:h-full flex items-center justify-center">
            {/* desktop image */}
            <Image
            src="/hero-thumbnail.png" 
            alt="example pictures"
            width={500} 
            height={300}
            className="hidden md:block"
            />
            {/* mobile slideshow */}
            <div className="relative w-full h-full md:hidden overflow-hidden">
                <div 
                    className="flex transition-transform duration-700 ease-in-out h-full" 
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {images.map((image, index) => (
                        <div key={index} className="w-full flex-shrink-0 h-full flex justify-center items-center">
                            <Image
                                src={image}
                                alt={`Slide ${index + 1}`}
                                width={500}  // Maintain original width
                                height={300} // Maintain original height
                                className="object-contain max-w-full max-h-full"
                            />
                        </div>
                    ))}
                </div>

                {/* Left Button */}
                <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
                    onClick={prevSlide}
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Right Button */}
                <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
                    onClick={nextSlide}
                >
                    <ChevronRight size={24} />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 w-2 rounded-full transition-all ${
                                currentIndex === index ? "bg-white scale-125" : "bg-gray-400"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
        {/* mobile try on button */}
        <div className="block md:hidden h-1/5 w-full flex justify-center items-center">
            <Link href="#try-now" className="inline-block bg-[var(--taupe)] text-white py-2 px-6 rounded-full text-2xl hover:bg-opacity-80">
                Try now
            </Link>
        </div>
        {/* background image */}
        <Image 
            src="/stars.png" 
            alt="sars"
            fill
            className="mt-10 object-cover z-[-1]" 
        />
    </div>
    )
}
