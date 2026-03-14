"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import MainHeader from "./components/main-header";
import PrivateRoute from "./components/privateRoute";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsSidebarOpen(mql.matches);

    const listener = (e: MediaQueryListEvent) => setIsSidebarOpen(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches)
      setIsSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <PrivateRoute>
      <div className="flex h-screen relative overflow-hidden bg-white">
        {isSidebarOpen && (
          <div
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 lg:hidden"
          />
        )}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col w-full overflow-hidden my-5 h-[calc(100vh-2.5rem)]">
          <MainHeader toggleSidebar={toggleSidebar} />
          <main className="p-5 bg-white flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </PrivateRoute>
  );
}
