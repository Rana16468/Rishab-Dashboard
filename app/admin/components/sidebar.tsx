"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  DollarSign,
  Store,
  FileText,
  BarChart,
  ChartArea,
} from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonbg, sidebarbg } from "@/contexts/theme";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "@/redux/Slices/authSlice";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  const isActive = (path: string) => pathname === path;

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Research", path: "/admin/research", icon: FileText },
    { name: "Conversation", path: "/admin/conversation", icon: ChartArea },
    { name: "Create Admin", path: "/admin/create-admin", icon: ShieldCheck },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div
      className={` ${sidebarbg} text-[#0D0D0D] h-screen overflow-y-auto py-5 md:py-0 z-50 transition-all duration-300 transform overflow-hidden
        w-[80%] sm:w-[70%] md:w-[50%] ${isOpen ? "lg:w-68 xl:w-72 md:rounded-2xl lg:mt-5 md:mt-0 rounded-l-none" : "lg:w-0"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isOpen ? "lg:translate-x-0" : "lg:-translate-x-full"}
        fixed top-0 left-0 
        lg:static
      `}
    >
      {/* Close Button (Mobile Only) */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 lg:hidden text-white bg-[#0D0D0D] focus:outline-none p-2 rounded-full"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Logo */}
      <Link href="/">
        <div className="flex justify-center mt-10 items-center gap-2 px-5">
          <h1 className="text-4xl font-bold mb-2">AMI</h1>
        </div>
      </Link>

      {/* Sidebar Menu */}
      <div className="mt-10 px-5 text-[10px] relative">
        <div className="relative flex flex-col gap-2">
          {/* The Glider (Sliding Background) */}
          <div
            className={`absolute left-0 w-full h-12 rounded-lg transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] z-0 ${buttonbg}`}
            style={{
              transform: `translateY(${navItems.findIndex((i) => isActive(i.path)) * (48 + 8)}px)`, // 48px height + 8px gap
              opacity: navItems.some((i) => isActive(i.path)) ? 1 : 0,
            }}
          />

          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="block relative z-10"
            >
              <div
                className={`flex items-center gap-2 px-3 h-12 rounded-lg cursor-pointer transition-colors duration-500 ${
                  isActive(item.path)
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <p className={`text-lg font-semibold`}>{item.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Logout Button with Shadcn AlertDialog */}
      <div className="absolute mt-8 md:mt-20 mmd:mt-20 w-full px-5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <AnimatedButton text="Logout" type="button" className="w-full" />
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be logged out of your account and redirected to the
                login page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  dispatch(logoutAction());
                  logout();
                  router.push("/auth");
                }}
                className="bg-red-500 hover:bg-red-600  text-white"
              >
                Log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
