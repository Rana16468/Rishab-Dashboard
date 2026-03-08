"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { buttonbg } from "@/contexts/theme";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { authApi } from "@/redux/Api/authApi";
import { toast } from "sonner";

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const resetToken = localStorage.getItem("resetToken");
    const savedUserData = localStorage.getItem("resetUserData");

    if (!resetToken || !savedUserData) {
      // If no token or user data found, redirect back to forgot password
      router.push("/auth/forget-password");
      return;
    }

    try {
      const parsedUserData = JSON.parse(savedUserData);
      setUserData(parsedUserData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/auth/forget-password");
    }
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);

      const response = await authApi.resetPassword(password);

      if (response.success) {
        toast.success(response.message || "Password reset successfully!");

        // Clear reset data from localStorage
        localStorage.removeItem("resetToken");
        localStorage.removeItem("resetUserData");
        localStorage.removeItem("resetEmail");

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/auth");
        }, 1500);
      } else {
        const errorMessage =
          response.errorSources?.[0]?.message ||
          response.message ||
          "Password reset failed";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errorSources?.[0]?.message ||
        error.response?.data?.message ||
        "Password reset failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-5">
      <div className="container mx-auto">
        <div className="flex  justify-center items-center">
          <div className="w-full lg:w-1/2 bg-white p-5 md:px-18 md:py-28 shadow-[0px_10px_20px_rgba(0,0,0,0.2)] rounded-2xl">
            <div className="flex justify-center items-center">
              <h2 className="text-4xl font-bold mb-5">AMI</h2>
            </div>
            <h2 className="text-[#0D0D0D] text-2xl  font-bold text-center mb-5">
              Set a new password
            </h2>
            <p className="text-[#6A6D76] text-center mb-10">
              Create a new password. Ensure it differs from previous ones for
              security
            </p>
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="w-full">
                <label className="text-xl text-[#0D0D0D] mb-2 font-bold">
                  New Password
                </label>
                <div className="w-full relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="**********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-[#6A6D76] rounded-md outline-none mt-5 placeholder:text-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-4 flex items-center text-[#6A6D76]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="w-full">
                <label className="text-xl text-[#0D0D0D] mb-2 font-bold">
                  Confirm New Password
                </label>
                <div className="w-full relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="**********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-[#6A6D76] rounded-md outline-none mt-5 placeholder:text-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-4 flex items-center text-[#6A6D76]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="w-1/3 mt-5">
                  <AnimatedButton
                    text={isLoading ? "Updating..." : "Update Password"}
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
