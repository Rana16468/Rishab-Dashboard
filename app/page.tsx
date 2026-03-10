"use client";
import { redirect } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    redirect("/auth");
  }

  redirect("/admin/dashboard");
}
