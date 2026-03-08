"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buttonbg, textPrimary } from "@/contexts/theme";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { authApi } from "@/redux/Api/authApi";
import { toast } from "sonner";

function VerificationCode() {
  const [code, setCode] = useState(new Array(5).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const router = useRouter();

  // Load email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      // If no email found, redirect back to forgot password
      router.push("/auth/forget-password");
    }
  }, [router]);

  const handleChange = (value: string, index: number) => {
    if (!isNaN(Number(value))) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 4) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 5) {
      toast.error("Please enter all 5 digits");
      return;
    }

    try {
      setIsLoading(true);

      const response = await authApi.verifyCode(verificationCode);

      if (response.success) {
        // Save the token to localStorage
        localStorage.setItem("resetToken", response.data);

        // Decode JWT token to get user data
        try {
          const decodedToken = JSON.parse(atob(response.data.split(".")[1]));
          // Save user data to localStorage for reset password page
          localStorage.setItem("resetUserData", JSON.stringify(decodedToken));
        } catch (error) {
          console.error("Error decoding token:", error);
        }

        toast.success(response.message || "Code verified successfully!");

        // Redirect to reset password page after a short delay
        setTimeout(() => {
          router.push("/auth/reset-password");
        }, 1500);
      } else {
        const errorMessage =
          response.errorSources?.[0]?.message ||
          response.message ||
          "Invalid verification code";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errorSources?.[0]?.message ||
        error.response?.data?.message ||
        "Verification failed";
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
              <h3 className="text-4xl font-bold mb-5">AMI</h3>
            </div>
            <h2 className="text-[#0D0D0D] text-2xl  font-bold text-center mb-5">
              Verification code
            </h2>
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-[#6A6D76] mb-10 w-full md:w-2/3 ">
                We sent a reset link to {email || "your email"} enter 5 digit
                code that is mentioned in the email.
              </p>
            </div>

            <form className="space-y-5">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    className="shadow-xs w-12 h-12 text-2xl text-center border border-[#6A6D76] text-[#0d0d0d] rounded-lg focus:outline-none"
                  />
                ))}
              </div>
            </form>
            <div className="flex justify-center items-center my-5">
              <div className="w-1/3 mt-5">
                <AnimatedButton
                  text={isLoading ? "Verifying..." : "Verify Code"}
                  onClick={handleVerifyCode}
                  type="button"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
            <p className="text-[#6A6D76] text-center mb-10">
              You have not received the email?{" "}
              <span className={`${textPrimary}`}> Resend</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationCode;
