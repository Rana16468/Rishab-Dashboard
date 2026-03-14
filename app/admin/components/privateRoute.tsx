"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setChecking(false);
      return;
    }

    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const fullName = localStorage.getItem("fullName");

    if (token && email) {
      login({ token, email, role: role || "", fullName: fullName || "" });
      setChecking(false);
      return;
    }

    router.replace("/auth");
    setChecking(false);
  }, [isAuthenticated, login, router]);

  if (checking || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return <>{children}</>;
}
