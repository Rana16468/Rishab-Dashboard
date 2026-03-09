"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ShieldCheck,
  Camera,
  Upload,
  User,
  Mail,
  Lock,
  Calendar,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import adminApi from "@/redux/Api/adminApi";
import { buttonbg } from "@/contexts/theme";

export default function CreateAdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    age: "",
    image: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    try {
      const adminData = {
        name: formData.name,
        nickname: formData.nickname,
        password: formData.password,
        email: formData.email,
        gender: formData.gender,
        age: formData.age,
        role: "admin",
      };

      const response = await adminApi.createAdminAccount(adminData);

      if (response.success) {
        toast.success("New admin created successfully!");
        setFormData({
          name: "",
          nickname: "",
          email: "",
          password: "",
          confirmPassword: "",
          gender: "male",
          age: "",
          image: null,
        });

        setTimeout(() => {
          router.push("/admin/users");
        }, 1500);
      } else {
        toast.error(response.message || "Failed to create admin");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Admin
          </h1>
          <p className="text-gray-600">Add a new administrator to your team</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`${buttonbg} px-8 py-6`}>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-white w-6 h-6" />
              <h2 className="text-white text-xl font-semibold">
                Admin Information
              </h2>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
          

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                {/* Nickname Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="nickname"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Users className="w-4 h-4" />
                    Nickname
                  </Label>
                  <Input
                    id="nickname"
                    placeholder="Enter nickname"
                    value={formData.nickname}
                    onChange={(e) =>
                      setFormData({ ...formData, nickname: e.target.value })
                    }
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                {/* Age Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="age"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Calendar className="w-4 h-4" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                {/* Gender Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-medium text-gray-700"
                  >
                    Gender
                  </Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="h-12 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className={`w-full h-14 text-base font-semibold ${buttonbg} text-white hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Admin Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Create Admin Account
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Admin accounts will have full access to the dashboard and user
            management.
          </p>
        </div>
      </div>
    </div>
  );
}
