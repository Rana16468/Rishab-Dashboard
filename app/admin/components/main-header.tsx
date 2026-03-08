"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { textPrimary, borderPrimary, sidebarbg } from "@/contexts/theme";

interface MainHeaderProps {
  toggleSidebar: () => void;
}

export default function MainHeader({ toggleSidebar }: MainHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Dummy unread count
  const unreadCount = 3;

  return (
    <div className="relative w-full px-5">
      <header className={`${sidebarbg} shadow-sm rounded-lg border border-[#E5E7EB] overflow-hidden`}>
        <div className="flex justify-between items-center px-5 md:px-10 h-[80px]">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className={`p-2 rounded hover:opacity-80 focus:outline-none cursor-pointer ${textPrimary}`}
          >
            <Menu className="w-8 h-8" />
          </button>
          <div className="flex items-center gap-4">
            {/* Notification */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => router.push('/admin/notifications')}
              className={`relative p-2 rounded-full border ${borderPrimary} hover:bg-white/60 transition cursor-pointer`}
            >
              <Bell className={`w-6 h-6  ${textPrimary}`} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 inline-flex h-2 w-2 rounded-full bg-[#E53E3E]"></span>
              )}
            </button>
            
            <div
              onClick={() => router.push("/admin/profile")}
              className="flex items-center gap-2 cursor-default"
            >
              {/* Avatar */}
                <div className={`w-8 md:w-12 h-8 md:h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-lg`}>
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
              
              <div>
                <h3 className="hidden md:block text-[#0D0D0D] text-lg font-semibold">
                  {user?.fullName || 'User'}
                </h3>
                <p className="text-[#0D0D0D] text-md capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
