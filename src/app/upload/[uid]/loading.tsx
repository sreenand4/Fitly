export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
      </header>
      
      <main className="flex-grow flex flex-col p-4 max-w-md mx-auto w-full">
        <div className="bg-white rounded-lg shadow p-5 mb-4">
          {/* Loading text */}
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
          
          {/* Loading upload area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
        
        {/* Loading tips section */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-4 text-center">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4 mx-auto"></div>
      </footer>
    </div>
  );
} 