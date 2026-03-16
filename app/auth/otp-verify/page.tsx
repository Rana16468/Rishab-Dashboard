"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buttonbg, textPrimary } from "@/contexts/theme";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { authApi, VerifyUserPayload } from "@/redux/Api/authApi";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/Slices/authSlice";
import { useAuth } from "@/contexts/auth-context";

function VerificationCode() {
  const [code, setCode] = useState(new Array(5).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();
  const { login } = useAuth();

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

      const payload: VerifyUserPayload = {
        verificationCode: parseInt(verificationCode, 10),
      };
      const response = await authApi.verifyUser(payload);

      // If we reach here, the request succeeded; check for accessToken
      const accessToken = response.accessToken;

      if (accessToken) {
        localStorage.setItem("token", accessToken);

        // Decode JWT to get user info
        try {
          const tokenParts = accessToken.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const user = {
              id: payload.id,
              email: payload.email,
              role: payload.role,
              name: payload.name || payload.email,
            };
            dispatch(loginSuccess({ user, token: accessToken }));

            // Also update auth context so dashboard recognizes login
            login({
              role: payload.role,
              fullName: payload.name || payload.email,
              email: payload.email,
              token: accessToken,
            });

            // Set cookie for middleware to read
            document.cookie = `token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `userRole=${payload.role}; path=/; max-age=86400; SameSite=Lax`;
          } else {
            throw new Error("Invalid token format");
          }
        } catch (decodeError) {
          // Still proceed even if decoding fails
        }

        toast.success(response.message || "Successfully verified your account");
        router.push("/admin/dashboard");
      } else {
        toast.error("Verification succeeded but no access token received");
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationCode;
