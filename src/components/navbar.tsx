import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full px-6 md:px-12 py-4 flex justify-between items-center z-50">
            {/* Fitly Logo/Text */}
            <div>
                <Link href="/" className="text-2xl md:text-3xl font-medium">
                    Fitly
                </Link>
            </div>
        </nav>
    );
}
