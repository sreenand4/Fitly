"use client";
 import Link from "next/link";
 import Image from "next/image";
 import {useEffect, useState} from "react";

 export default function Navbar() { 
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const scrollTo = (id : string) => {
        if (isClient) {
            document.getElementById(id)?.scrollIntoView({behavior: "smooth"});
        }
    }

    return (
        <nav className="fixed top-0 left-0 w-full bg-[var(--bone)] px-25 flex justify-between items-center z-50">
            <div className="flex items-center text-4xl justify-center md:justify-start w-full md:w-auto">
                <Image src="/logo.png" alt="Fitly" width={150} height={50} />
            </div>

            <ul className="hidden md:flex space-x-6 text-[var(--jet)] text-lg lg:text-2xl">
                <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => scrollTo("home")}>Home</li>
                <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => scrollTo("about")}>About Us</li>
                <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => scrollTo("partners")}>For Partners</li>
                <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => scrollTo("contact")}>Contact Us</li>
                <button 
                    className="hidden md:block bg-[var(--taupe)] text-white px-4 py-1 rounded-full hover:opacity-80"
                    onClick={() => scrollTo("signup")}
                >
                    Sign Up
                </button>
            </ul>
        </nav>
    )

 }