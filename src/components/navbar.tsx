"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [isClient, setIsClient] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        setIsClient(true);
        const checkUser = async () => {
            try {
                await getCurrentUser();
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
            }
        };
        checkUser();
    }, [pathname]);

    const handleNavigation = (id: string) => {
        if (typeof window !== "undefined") {
            if (window.location.pathname !== "/") {
                router.push("/");
                setTimeout(() => {
                    const element = document.getElementById(id);
                    if (element) {
                        const y = element.getBoundingClientRect().top + window.scrollY - 60;
                        window.scrollTo({ top: y, behavior: "smooth" });
                    }
                }, 100);
            } else {
                const element = document.getElementById(id);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 60;
                    window.scrollTo({ top: y, behavior: "smooth" });
                    setIsMobileMenuOpen(false)
                }
            }
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full bg-[var(--bone)] px-4 md:px-25 py-1 flex justify-between items-center z-50">
                {/* Hamburger Menu Button - Now positioned absolutely */}
                <button 
                    className="md:hidden absolute right-4 p-2 text-[var(--jet)] hover:text-[var(--taupe)]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <div className="w-6 h-4 flex flex-col justify-between">
                        <span className={`w-full h-0.5 bg-current transform transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                        <span className={`w-full h-0.5 bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-full h-0.5 bg-current transform transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                    </div>
                </button>

                {/* Centered Logo */}
                <div className="w-full md:w-1/4 flex justify-center md:justify-start">
                    <Link href="/" className="flex items-center text-4xl">
                        <Image src="/logo.png" alt="Fitly" width={150} height={50} />
                    </Link>
                </div>
                
                {/* Desktop Navigation */}
                {!isAuthenticated ? (
                    <ul className="hidden md:flex md:w-3/4 justify-end space-x-6 text-[var(--jet)] text-xl lg:text-2xl items-center">
                        <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => handleNavigation("home")}>Home</li>
                        <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => handleNavigation("about")}>About Us</li>
                        <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => handleNavigation("partners")}>For Partners</li>
                        <li className="cursor-pointer hover:text-[var(--taupe)] py-1" onClick={() => handleNavigation("contact")}>Contact Us</li>
                        <li className="cursor-pointer hover:text-[var(--taupe)] py-1">
                            <Link href="/auth">Sign In</Link>
                        </li>
                    </ul>
                ) : (
                    <ul className="hidden md:flex md:w-3/4 justify-end space-x-6 text-[var(--jet)] text-xl lg:text-2xl items-center">
                        <li>
                            <Link href="/dashboard" className="hover:text-[var(--taupe)]">Dashboard</Link>
                        </li>
                        <li>
                            <Link href="/size-estimation" className="hover:text-[var(--taupe)]">Size Estimation</Link>
                        </li>
                        <li>
                            <Link href="/fittingroom" className="hover:text-[var(--taupe)]">Fitting Room</Link>
                        </li>
                        <li>
                            <Link href="/profile" className="hover:text-[var(--taupe)]">Profile</Link>
                        </li>
                    </ul>
                )}
            </nav>

            {/* Mobile Navigation Menu */}
            <div className={`fixed top-[90px] left-0 w-full bg-[var(--bone)] shadow-lg transition-transform duration-300 ease-in-out transform md:hidden ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'} z-40`}>
                {!isAuthenticated ? (
                    <ul className="flex flex-col py-4 px-6 space-y-4 text-[var(--jet)] text-xl text-center">
                        <li className="cursor-pointer hover:text-[var(--taupe)]" onClick={() => handleNavigation("home")}>Home</li>
                        <li className="cursor-pointer hover:text-[var(--taupe)]" onClick={() => handleNavigation("about")}>About Us</li>
                        <li className="cursor-pointer hover:text-[var(--taupe)]" onClick={() => handleNavigation("partners")}>For Partners</li>
                        <li className="cursor-pointer hover:text-[var(--taupe)]" onClick={() => handleNavigation("contact")}>Contact Us</li>
                        <li className="cursor-pointer hover:text-[var(--taupe)]">
                            <Link href="/auth">Sign In</Link>
                        </li>
                    </ul>
                ) : (
                    <ul className="flex flex-col py-4 px-6 space-y-4 text-[var(--jet)] text-xl text-center">
                        <li> <Link href="/dashboard" className="hover:text-[var(--taupe)]">Dashboard</Link> </li>
                        <li> <Link href="/size-estimation" className="hover:text-[var(--taupe)]">Size Estimation</Link> </li>
                        <li> <Link href="/fittingroom" className="hover:text-[var(--taupe)]">Fitting Room</Link> </li>
                        <li> <Link href="/profile" className="hover:text-[var(--taupe)]">Settings</Link> </li>
                        <li className="cursor-pointer hover:text-[var(--taupe)]" onClick={async () => {
                            await signOut();
                            setIsAuthenticated(false);
                            router.push("/");
                        }}>
                            Sign Out
                        </li>
                    </ul>
                )}
            </div>
        </>
    );
}
