"use client";

import { signOut, fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import { User, Mail, Badge, Ruler } from 'lucide-react';

const client = generateClient<Schema>();

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [userModel, setUserModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const attrs = await fetchUserAttributes();
        setProfile(attrs);
        console.log(attrs);
        const userId = attrs.sub;
        console.log("userId", userId);
        if (userId) {
          const { data: userData } = await client.models.User.get({ id: userId });
          console.log("userData", userData);
          setUserModel(userData);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
                <button className="px-4 py-1 mb-2 hover:bg-[var(--taupe)] hover:text-white border-2 border-[var(--taupe)] rounded-full cursor-pointer font-sans" onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>
            {/* Profile Info Card */}
            <div className="max-w-xl w-full mx-auto bg-[var(--bone)] rounded-2xl shadow-md p-8 flex flex-col gap-4 border border-[var(--taupe)]">
              {loading ? (
                <div className="text-center text-[var(--taupe)] font-sans">Loading profile...</div>
              ) : profile ? (
                <>
                  <div className="flex flex-row gap-6 mb-2">
                    <div className="flex-1 flex items-center gap-2">
                      <User className="h-5 w-5 text-[var(--taupe)]" />
                      <div>
                        <div className="text-xs text-[var(--taupe)] font-sans mb-1">First Name</div>
                        <div className="text-lg text-[var(--jet)] font-semibold font-sans">{userModel?.firstName || profile.given_name || "-"}</div>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <User className="h-5 w-5 text-[var(--taupe)]" />
                      <div>
                        <div className="text-xs text-[var(--taupe)] font-sans mb-1">Last Name</div>
                        <div className="text-lg text-[var(--jet)] font-semibold font-sans">{userModel?.lastName || profile.family_name || "-"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-6 mb-2">
                    <div className="flex-1 flex items-center gap-2">
                      <div>
                        <div className="text-xs text-[var(--taupe)] font-sans mb-1">Email</div>
                        <div className="text-lg text-[var(--jet)] font-sans">{profile.email || "-"}</div>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div>
                        <div className="text-xs text-[var(--taupe)] font-sans mb-1">Username</div>
                        <div className="text-lg text-[var(--jet)] font-sans">{userModel?.username || profile.preferred_username || profile.email || "-"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-6 mb-2">
                    <div className="flex-1 flex items-center gap-2">
                      <div>
                        <div className="text-xs text-[var(--taupe)] font-sans mb-1">Gender</div>
                        <div className="text-lg text-[var(--jet)] font-sans">{userModel?.gender === "M" ? "Male" : userModel?.gender === "F" ? "Female" : "-"}</div>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div>
                        <div className="text-xs text-[var(--taupe)] font-sans mb-1">Height (cm)</div>
                        <div className="text-lg text-[var(--jet)] font-sans">{userModel?.height || "-"}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-[var(--taupe)] font-sans">No profile information found.</div>
              )}
            </div>
        </div>
    </div>
  )
}