"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const scrollTo = (id: string, offset: number = -60) => {
        if (typeof window !== "undefined") {
            const element = document.getElementById(id);
            if (element) {
                const y = element.getBoundingClientRect().top + window.scrollY + offset;
                window.scrollTo({ top: y, behavior: "smooth" });
            }
        }
    };

    const handleNavigation = (id: string) => {
        if (window.location.pathname !== "/") {
            router.push("/");
            setTimeout(() => scrollTo(id), 200); // Adjust timeout if needed
        } else {
            scrollTo(id);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-[var(--bone)] px-25 flex justify-between items-center z-50">
            <Link href="/" className="flex items-center text-4xl justify-center md:justify-start w-full md:w-auto">
                <Image src="/logo.png" alt="Fitly" width={150} height={50} />
            </Link>

            <ul className="hidden md:flex space-x-6 text-[var(--jet)] text-xl lg:text-2xl">
                <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => handleNavigation("home")}>Home</li>
                <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => handleNavigation("about")}>About Us</li>
                <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => handleNavigation("partners")}>For Partners</li>
                <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => handleNavigation("contact")}>Contact Us</li>
            </ul>
        </nav>
    );
}
