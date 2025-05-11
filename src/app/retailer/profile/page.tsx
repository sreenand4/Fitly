"use client";

import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            // Clear the user type cookie
            document.cookie = 'userType=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';          
            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };


  return (
    <div className="w-screen h-screen flex flex-col md:flex-row justify-center">
         {/* Profile */}
        <div className="w-full h-full flex flex-col mt-20 gap-10 px-10 md:px-20">
            {/* Header */}
            <div className="flex flex-row items-end border-b-2 border-[var(--taupe)]] justify-between pt-10 pb-1">
                <div className="flex flex-col">
                    <p className="font-sans">Welcome to your</p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl">Profile</h1>
                </div>
                <button className="px-4 py-2 hover:bg-[var(--bone)] cursor-pointer" onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>
        </div>
    </div>
  )
}