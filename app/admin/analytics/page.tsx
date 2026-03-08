"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg, textPrimary, borderPrimary } from "@/contexts/theme";

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      
      {/* Header */}
      <div className={`${buttonbg} rounded-xl p-4 px-6 shadow-sm`}>
          <h1 className="text-2xl font-bold text-white">Engagement Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Age Groups - Column Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Age Groups</h2>
            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pl-4 ml-10 border-l border-b border-gray-200 relative">
                 {/* Y-Axis Labels */}
                 <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
                     <span>8000</span>
                     <span>6000</span>
                     <span>4000</span>
                     <span>2000</span>
                     <span>0</span>
                 </div>

                 {/* Columns */}
                 {[
                    { label: "0-18", value: 3000, height: "35%" },
                    { label: "18-24", value: 7500, height: "85%" },
                    { label: "25-34", value: 5000, height: "60%" },
                    { label: "35-44", value: 6000, height: "70%" },
                    { label: "45-54", value: 4000, height: "45%" },
                    { label: "55+", value: 2000, height: "25%" },
                 ].map((item, i) => (
                     <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group relative">
                         <div className="w-4 md:w-10 h-full bg-green-50 rounded-t-sm relative flex flex-col justify-end overflow-hidden hover:bg-green-100 transition-colors cursor-pointer">
                            <div 
                                className="w-full bg-[#2E6F65] hover:bg-[#255c53] transition-all duration-500 rounded-t-sm" 
                                style={{ height: item.height }}
                            ></div>
                         </div>
                         <span className="text-xs text-gray-500">{item.label}</span>
                         {/* Tooltip */}
                         <div className="absolute -top-8 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {item.value} Users
                         </div>
                     </div>
                 ))}
            </div>
        </div>

        {/* Top Countries - Horizontal Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Top Countries</h2>
            <div className="h-64 flex flex-col justify-center gap-5">
                {[
                    { country: "USA", value: 85, color: "bg-[#2E6F65]" },
                    { country: "UK", value: 65, color: "bg-[#2E6F65]/80" },
                    { country: "Canada", value: 50, color: "bg-[#2E6F65]/60" },
                    { country: "Australia", value: 35, color: "bg-[#2E6F65]/40" },
                    { country: "Germany", value: 20, color: "bg-[#2E6F65]/20" },
                ].map((item, i) => (
                    <div key={i} className="grid grid-cols-[80px_1fr] items-center gap-4 group">
                        <span className="text-sm font-semibold text-gray-700">{item.country}</span>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                             <div 
                                className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} 
                                style={{ width: `${item.value}%` }}
                             ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Most Clicked Categories - Donut */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-gray-800 mb-6">Most Clicked Categories</h2>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                {/* CSS Conic Gradient Donut */}
                 <div className="relative w-48 h-48 rounded-full" style={{ background: `conic-gradient(#2E6F65 0% 45%, #58976B 45% 75%, #A7D3A6 75% 100%)` }}>
                     <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                         <span className="text-2xl font-bold text-gray-800">Total<br/><span className="text-sm font-normal text-gray-500">Clicks</span></span>
                     </div>
                 </div>

                 <div className="space-y-3">
                     {[
                         { label: "Escir", value: "45%", color: "bg-[#2E6F65]" },
                         { label: "Eveers", value: "30%", color: "bg-[#58976B]" },
                         { label: "Shang", value: "25%", color: "bg-[#A7D3A6]" },
                     ].map((item, i) => (
                         <div key={i} className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                             <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                             <span className="text-sm text-gray-400">({item.value})</span>
                         </div>
                     ))}
                 </div>
             </div>
        </div>

        {/* Avg Session Time - Line Chart (SVG) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-gray-800 mb-6">Avg Session Time by Category</h2>
             <div className="h-64 relative border-l border-b border-gray-200 ml-8">
                 <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
                     <span>400</span>
                     <span>300</span>
                     <span>200</span>
                     <span>100</span>
                     <span>0</span>
                 </div>
                 
                 {/* SVG Line */}
                 <svg className="w-full h-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="0" x2="100" y2="0" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="75" x2="100" y2="75" stroke="#f3f4f6" strokeWidth="0.5" />

                      {/* The Data Line */}
                      <path 
                        d="M0,80 Q25,30 50,60 T100,20" 
                        fill="none" 
                        stroke="#2E6F65" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="drop-shadow-md"
                      />
                      {/* Points */}
                      <circle cx="0" cy="80" r="1.5" fill="white" stroke="#2E6F65" strokeWidth="1" />
                      <circle cx="50" cy="60" r="1.5" fill="white" stroke="#2E6F65" strokeWidth="1" />
                      <circle cx="100" cy="20" r="1.5" fill="white" stroke="#2E6F65" strokeWidth="1" />
                 </svg>

                 <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-500 px-2 pt-2">
                     <span>Jan</span>
                     <span>Feb</span>
                     <span>Mar</span>
                     <span>Apr</span>
                     <span>May</span>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
}
