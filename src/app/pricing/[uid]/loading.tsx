export default function PricingLoading() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Pricing Plans</h1>
      <div className="w-full max-w-4xl mx-auto flex justify-center">
        <div className="animate-pulse flex flex-col w-full">
          <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
} 