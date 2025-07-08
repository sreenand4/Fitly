"use client";

export default function CancelPage() {
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow flex flex-col p-4 mx-auto w-full h-full justify-center items-center bg-[#ededed]">
        {/* Cancel Message */}
        <div className="bg-white rounded-2xl shadow px-10 py-10 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Failed</h2>
          <p className="text-gray-600 mb-6">
            Checkout session canceled.
          </p>
        </div>
      </main>
      
      <footer className="py-4 px-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Fitly
      </footer>
    </div>
  );
} 