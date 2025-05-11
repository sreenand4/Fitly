"use client";

import { useState, useEffect } from "react";
import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, fetchUserAttributes, updateUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/../../amplify/data/resource";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    // State variables
    const [isSignUp, setIsSignUp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    // Sign up cognito variables
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isRetailer, setIsRetailer] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);
    const [userAttributes, setUserAttributes] = useState<any>(null);
    // Collect profile variables
    const [isCollectingProfile, setIsCollectingProfile] = useState(false);
    const [preferredUsername, setPreferredUsername] = useState("");
    const [heightFeet, setHeightFeet] = useState("5");
    const [heightInches, setHeightInches] = useState("6");
    const [gender, setGender] = useState("M");
    const [companyName, setCompanyName] = useState("");
    const [bio, setBio] = useState("");
    // Router
    const router = useRouter();

    // Check if user is already authenticated and fetch attributes
    useEffect(() => {
        const checkUser = async () => {
            try {
                const attributes = await fetchUserAttributes();
                console.log("Attributes:", attributes);
                
                // Check user type and redirect accordingly
                const userType = attributes['custom:userType'];
                console.log("User type:", userType);
                
                if (userType === 'retailer') {
                    console.log("Redirecting to retailer dashboard...");
                    router.replace("/retailer/dashboard");
                } else {
                    console.log("Redirecting to user dashboard...");
                    router.replace("/user/dashboard");
                }
            } catch (error) {
                console.error("Error fetching user attributes:", error);
                setUser(null);
                setUserAttributes(null);
            }
        };
        checkUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            if (isSignUp) {
                await signUp({
                    username: email,
                    password,
                    options: {
                        userAttributes: {
                            given_name: firstName,
                            family_name: lastName,
                            email,
                            'custom:userType': isRetailer ? "retailer" : "consumer",
                            'custom:companyName': isRetailer ? companyName : "",
                        },
                    },
                });
                setIsVerifying(true);
            } else {
                await signIn({
                    username: email,
                    password,
                });
                // Get user attributes to determine redirect
                const attributes = await fetchUserAttributes();
                const userType = attributes['custom:userType'];
                
                // Set the user type cookie
                document.cookie = `userType=${userType}; path=/`;
                
                if (userType === 'retailer') {
                    router.push("/retailer/dashboard");
                } else {
                    router.push("/user/dashboard");
                }
            }
        } catch (error: any) {
            setError(error.message || "An error occurred");
        }
    };

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await confirmSignUp({
                username: email,
                confirmationCode: verificationCode,
            });
            await signIn({
                username: email,
                password,
            });
            const currentUser = await getCurrentUser();
            const attributes = await fetchUserAttributes();
            setUser(currentUser);
            setUserAttributes(attributes);
            
            // Set the user type cookie after verification
            const userType = isRetailer ? "retailer" : "consumer";
            document.cookie = `userType=${userType}; path=/`;
            
            setIsVerifying(false);
            setIsCollectingProfile(true);
        } catch (error: any) {
            setError(error.message || "An error occurred");
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setUser(null);
            setUserAttributes(null);
        } catch (error: any) {
            setError(error.message || "An error occurred");
        }
    };

    // Function to convert feet and inches to centimeters
    const convertToCentimeters = (feet: number, inches: number): number => {
        const totalInches = feet * 12 + inches;
        return totalInches * 2.54;
    };

    // Handler for profile form submission
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            console.log("Starting profile submission...");
            const client = generateClient<Schema>();
            console.log("Client generated, trying to create user");

            if (isRetailer) {
                // Create retailer profile
                const retailerData = {
                    id: user.userId,
                    name: companyName,
                    bio: bio,
                };
                console.log("Retailer data to save:", retailerData);
                
                const createRetailerResult = await client.models.Retailer.create(retailerData);
                console.log("Retailer created successfully:", createRetailerResult);

                // Update Cognito user attributes with company name
                await updateUserAttributes({
                    userAttributes: {
                        'custom:companyName': companyName
                    }
                });
                
                // Ensure user type cookie is set
                document.cookie = `userType=retailer; path=/`;
                
                router.push("/retailer/dashboard");
            } else {
                // Create regular user profile
                const heightInCm = convertToCentimeters(parseInt(heightFeet), parseInt(heightInches));
                console.log("Height calculated:", heightInCm);
                
                const userData = {
                    username: preferredUsername,
                    firstName: userAttributes.given_name,
                    lastName: userAttributes.family_name,
                    height: heightInCm,
                    gender,
                };
                console.log("User data to save:", userData);
                
                const createResult = await client.models.User.create(userData);
                console.log("User created successfully:", createResult);
                
                // Ensure user type cookie is set
                document.cookie = `userType=consumer; path=/`;
                
                router.push("/user/dashboard");
            }
        } catch (err: any) {
            console.error("Error creating profile:", err);
            console.error("Error details:", JSON.stringify(err, null, 2));
            setError("Failed to save profile: " + err.message);
        }
    };

  if (isCollectingProfile) {
    return (
      <div className="w-screen h-screen flex flex-col md:flex-row justify-center">
        {/* Left side */}
        <div className="hidden md:flex md:flex-1 bg-[var(--taupe)] items-center justify-center px-10 rounded-br-[60px]">
          <Image src="/logo_light.png" alt="FITLY" width={250} height={500} />
        </div>

        {/* Right side */}
        <div className="w-full md:flex-1 flex flex-col justify-center items-center md:items-start px-4 md:px-20 py-8">
          <h2 className="text-[var(--jet)] text-4xl md:text-6xl">
            {isRetailer ? "Tell us about your business" : "Tell us about yourself"}
          </h2>
          <p className="text-[var(--jet)] text-sm mb-6 font-sans">
            {isRetailer 
              ? "Help customers learn more about your brand!"
              : "We use this info to personalize your experience and size recommendations!"
            }
          </p>

          <form onSubmit={handleProfileSubmit} className="w-full max-w-md">
            {isRetailer ? (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)] font-sans"
                    required
                  />
                </div>
                <div className="mb-6">
                  <textarea
                    placeholder="Company Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)] font-sans h-32"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Preferred Username"
                    value={preferredUsername}
                    onChange={(e) => setPreferredUsername(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)] font-sans"
                    required
                  />
                </div>
                <div className="mb-4 flex gap-2">
                  <select
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="w-1/2 px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)]"
                  >
                    {Array.from({ length: 4 }, (_, i) => i + 4).map((feet) => (
                      <option key={feet} value={feet}>{feet} ft</option>
                    ))}
                  </select>
                  <select
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="w-1/2 px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)]"
                  >
                    {Array.from({ length: 12 }, (_, i) => i).map((inches) => (
                      <option key={inches} value={inches}>{inches} in</option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)]"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <p className="text-red-600 text-sm font-sans mb-4">{error}</p>
            )}

            <button
              type="submit"
              className="bg-[var(--taupe)] w-full text-white px-6 py-2 rounded-full text-lg md:text-xl hover:bg-[#4A362A] transition"
            >
              Continue to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="w-screen h-screen flex flex-col md:flex-row justify-center">
        {/* Left side */}
        <div className="hidden md:flex md:flex-1 bg-[var(--taupe)] items-center justify-center px-10 rounded-br-[60px]">
          <Image src="/logo_light.png" alt="FITLY" width={250} height={500} />
        </div>

        {/* Right side */}
        <div className="w-full md:flex-1 flex flex-col justify-center items-center md:items-start px-4 md:px-20 py-8">
          <h2 className="text-[var(--jet)] text-4xl md:text-6xl">Verify Email</h2>
          <p className="text-[var(--jet)] text-sm mb-6 font-sans">
            Please enter the verification code sent to your email
          </p>

          <form onSubmit={handleVerification} className="w-full max-w-md">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)] font-sans"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm font-sans mb-4">{error}</p>
            )}

            <button
              type="submit"
              className="bg-[var(--taupe)] w-full text-white px-6 py-2 rounded-full text-lg md:text-xl hover:bg-[#4A362A] transition"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    );
  }


  return (
    <div className="w-screen h-screen flex flex-col md:flex-row justify-center">
      {/* Left side */}
      <div className="hidden md:flex md:flex-1 bg-[var(--taupe)] items-center justify-center px-10 rounded-br-[60px]">
        <Image src="/logo_light.png" alt="FITLY" width={250} height={500} />
      </div>

      {/* Right side */}
      <div className="w-full md:flex-1 flex flex-col justify-center items-center md:items-start px-4 md:px-20 py-8">
        <h2 className="text-[var(--jet)] text-4xl md:text-6xl">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>
        <p className="text-[var(--jet)] text-sm mb-6 font-sans">
          {isSignUp
            ? "Already have an account? "
            : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="underline"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          {isSignUp && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)] font-sans"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)] font-sans"
                  required
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)] font-sans"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[#3C2F26] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--taupe)] font-sans"
              required
            />
          </div>
          {isSignUp && (
            <>
            <label className="flex gap-2 mb-4 items-center">
              <input 
                type="checkbox" 
                checked={isRetailer} 
                onChange={() => {setIsRetailer(!isRetailer)}}
                className={`w-5 h-5 accent-[var(--taupe)] ${isRetailer ? "bg-[var(--taupe)]" : "bg-[var(--jet)]"}`}
              />
              <span className="font-sans text-md md:text-lg">Sign up for a retailer account</span>
            </label>
            </>
          )}

          {error && (
            <p className="text-red-600 text-sm font-sans mb-4">{error}</p>
          )}

          <button
            type="submit"
            className="bg-[var(--taupe)] w-full text-white px-6 py-2 rounded-full text-lg md:text-xl hover:bg-[#4A362A] transition"
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
} 