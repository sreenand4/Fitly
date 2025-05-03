"use client";

export default function SizeEstimation() {
  return (
    <div className="w-screen h-screen flex flex-col md:flex-row justify-center">
         {/* Sizing Room */}
        <div className="w-full h-full flex flex-col mt-20 gap-10 px-10 md:px-20">
            {/* Header */}
            <div className="flex flex-row items-end border-b-2 border-[var(--taupe)]] justify-between pt-10 pb-1">
                <div className="flex flex-col">
                    <p className="font-sans">Welcome to the</p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl">Sizing Room</h1>
                </div>
            </div>
        </div>
    </div>
  )
}