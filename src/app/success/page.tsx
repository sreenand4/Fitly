"use client";

export default function SuccessPage() {
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow flex flex-col p-4 mx-auto w-full h-full justify-center items-center bg-[#ededed]">
        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow px-10 py-10 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4">Successful!</h2>
          <h3 className="font-medium text-[#2b2b2b] mb-2">Close and re-open the extension to see your added credits</h3>
        </div>
      </main>
      
      <footer className="py-4 px-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Fitly
      </footer>
    </div>
  );
} 