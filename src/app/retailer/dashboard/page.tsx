"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { ShoppingBag } from "lucide-react";

export default function RetailerDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userAttributes = await fetchUserAttributes();
        console.log(userAttributes);
        setUserName(userAttributes.given_name || "");
        setCompanyName(userAttributes['custom:companyName'] || "");
      } catch {
        router.push('/auth');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-[var(--linen)] flex flex-col pt-30 px-2 md:px-0 mb-60">
      {/* Welcome message at the top */}
      <div className="max-w-7xl mx-auto w-full flex flex-col px-4 sm:px-6 md:px-8 lg:px-10">
        <h1 className="text-4xl md:text-5xl text-[var(--jet)] mb-1">Welcome back, {userName}</h1>
        <p className="text-md text-[var(--jet)] font-sans">Manage {companyName}'s products and try-ons here.</p>
        <hr className="w-full mt-4 border-1 border-[var(--taupe)]" />
      </div>
      {/* Body */}
      <div className="max-w-7xl mx-auto w-full flex flex-col px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Call to action -> products */}
        <section className="max-w-7xl mx-auto w-full mt-8 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between bg-[var(--bone)] rounded-xl p-6 gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center bg-[var(--linen)] border border-[var(--taupe)] rounded-full w-10 h-10 min-w-10 min-h-10 aspect-square flex-shrink-0 text-xl">
                <ShoppingBag className="h-5 w-5 text-fitly-taupe" />
              </span>
              <div>
                <h2 className="font-bold text-lg text-[var(--jet)] font-sans">Manage Your Products</h2>
                <p className="text-[var(--jet)] text-sm font-sans">Add new products, update existing ones, and manage the items available for virtual try-ons.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/retailer/products')}
              className="bg-[var(--linen)] border border-[var(--taupe)] text-[var(--jet)] rounded-full px-6 py-2 font-medium hover:bg-[var(--taupe)] hover:text-white transition font-sans md:ml-4 md:bg-[var(--linen)] md:text-[var(--jet)] md:hover:bg-[var(--taupe)] md:hover:text-white w-full md:w-auto text-left md:text-center bg-[var(--taupe)] text-white md:bg-[var(--linen)] md:text-[var(--jet)]"
            >
              Manage Products →
            </button>
          </div>
        </section>

        {/* Customer Try-ons Section */}
        <section className="max-w-7xl mx-auto w-full mb-6">
          <div className="bg-[var(--bone)] rounded-xl px-6 pt-4 pb-6 shadow-sm">
            <h2 className="font-bold text-xl text-[var(--jet)] mb-4 font-sans">Your Customer Try-ons</h2>
            <div className="flex flex-col items-center justify-center min-h-[160px]">
              {/* Placeholder for no try-ons */}
              <div className="flex flex-col items-center gap-2">
                <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" className="text-[var(--taupe)]"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4v1H4v-1z"/></svg>
                <span className="text-[var(--taupe)] text-base font-sans">No try-ons yet</span>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section className="max-w-7xl mx-auto w-full mb-10">
          <div className="bg-[var(--bone)] rounded-xl px-6 pt-4 pb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
              <div>
                <h2 className="font-bold text-xl text-[var(--jet)] font-sans">Virtual try-on analytics</h2>
                <p className="text-[var(--jet)] text-sm font-sans">Track the usage and impact of virtual try-ons for your products</p>
              </div>
              {/* Analytics button: mobile below cards, desktop inline */}
              <div className="flex md:justify-end mt-4 md:mt-0">
                <button
                  onClick={() => router.push('/retailer/analytics')}
                  className="bg-[var(--taupe)] text-white border border-[var(--taupe)] rounded-full px-5 py-2 font-medium transition w-full md:w-fit self-start md:self-auto font-sans md:bg-[var(--linen)] md:text-[var(--jet)] md:hover:bg-[var(--taupe)] md:hover:text-white"
                >
                  View detailed →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="bg-[var(--linen)] border border-[var(--taupe)] rounded-lg pl-6 pr-4 py-4 flex flex-col">
                <span className="text-s text-[var(--jet)] font-semibold mb-1 font-sans">Total Try-Ons</span>
                <span className="text-3xl font-bold text-[var(--taupe)]">256</span>
                <span className="text-xs text-[var(--taupe)] font-sans">Since launch</span>
              </div>
              <div className="bg-[var(--linen)] border border-[var(--taupe)] rounded-lg pl-6 pr-4 py-4 flex flex-col">
                <span className="text-s text-[var(--jet)] font-semibold mb-1 font-sans">Return Rate Reduction</span>
                <span className="text-3xl font-bold text-[var(--taupe)]">14<span className="text-lg align-top"> %</span></span>
                <span className="text-xs text-[var(--taupe)] font-sans">Compared to last month</span>
              </div>
              <div className="bg-[var(--linen)] border border-[var(--taupe)] rounded-lg pl-6 pr-4 py-4 flex flex-col">
                <span className="text-s text-[var(--jet)] font-semibold mb-1 font-sans">Purchase Confidence</span>
                <span className="text-3xl font-bold text-[var(--taupe)]">35<span className="text-lg align-top"> %</span></span>
                <span className="text-xs text-[var(--taupe)] font-sans">Based on customer feedback</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
