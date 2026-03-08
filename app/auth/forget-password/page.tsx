"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buttonbg } from "@/contexts/theme";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { authApi } from "@/redux/Api/authApi";
import { toast } from "sonner";

function ForgetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);

      const response = await authApi.forgotPassword({ email });

      if (response.success) {
        toast.success(response.message || "Reset code sent successfully!");
        // Store email in localStorage for verification page
        localStorage.setItem("resetEmail", email);
        // Redirect to verification code page after a short delay
        setTimeout(() => {
          router.push("/auth/verification-code");
        }, 1500);
      } else {
        // Handle error response with errorSources
        const errorMessage =
          response.errorSources?.[0]?.message ||
          response.message ||
          "Failed to send reset code";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      // Handle structured API error response
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.errorSources?.[0]?.message ||
          errorData.message ||
          "Failed to send reset code";
        toast.error(errorMessage);
      } else {
        const errorMessage = error.message || "Failed to send reset code";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-5">
      <div className="container mx-auto">
        <div className="flex  justify-center items-center ">
          <div className="w-full md:w-1/2 lg:w-1/2 p-5 md:px-[100px] md:py-[200px] bg-white  shadow-[0px_10px_20px_rgba(0,0,0,0.2)] rounded-2xl">
            <div className="flex justify-center items-center">
              <h3 className="text-4xl font-bold text-[#0D0D0D] mb-5">AMI</h3>
            </div>
            <h2 className="text-[#0D0D0D] text-2xl  font-bold text-center mb-5">
              Forgot password ?
            </h2>
            <form className="space-y-5" onSubmit={handleSendCode}>
              <div>
                <label className="text-xl text-[#0D0D0D] mb-2 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email ...."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-[#6A6D76] rounded-md outline-none mt-5 placeholder:text-xl"
                  required
                />
              </div>

              <div className="flex justify-center items-center">
                <div className="w-1/3 mt-5">
                  <AnimatedButton
                    text={isLoading ? "Sending..." : "Send Code"}
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

export default ForgetPassword;
