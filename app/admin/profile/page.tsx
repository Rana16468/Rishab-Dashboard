"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { authApi } from "@/redux/Api/authApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { activeTabClass, buttonbg } from "@/contexts/theme";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("edit-profile");
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await authApi.myProfile();
        setProfileData(data.data);
      } catch (error) {
        //
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-linear-to-br from-[#2E6F65] to-[#58976B] p-1">
              <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                <Image
                  src={profileData?.photo || "/ami.png"}
                  alt="User Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {profileData?.name || user?.fullName || "Admin User"}
              </h2>
              <p className="text-gray-600 mb-4">
                {profileData?.role || user?.role || "Administrator"}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Active
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {profileData?.email || "admin@example.com"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <Tabs
              defaultValue="edit-profile"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 rounded-none">
                <TabsTrigger
                  value="edit-profile"
                  className={`${activeTabClass}  border-b-2 border-transparent data-[state=active]:border-[#5833b1] data-[state=active]:bg-transparent transition-all cursor-pointer px-6 py-4 text-gray-600 rounded-2xl data-[state=active]:text-[#2E6F65] font-medium`}
                >
                  Edit Profile
                </TabsTrigger>
                <TabsTrigger
                  value="change-password"
                  className={`${activeTabClass} rounded-2xl border-b-2 border-transparent data-[state=active]:border-[#7e14c5] data-[state=active]:bg-transparent transition-all cursor-pointer px-6 py-4 text-gray-600 data-[state=active]:text-[#2E6F65] font-medium`}
                >
                  Change Password
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="edit-profile" className="mt-0">
                  <EditProfileForm
                    user={user}
                    profileData={profileData}
                    setProfileData={setProfileData}
                  />
                </TabsContent>

                <TabsContent value="change-password" className="mt-0">
                  <ChangePasswordForm />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components (Forms) ---

function EditProfileForm({
  user,
  profileData,
  setProfileData,
}: {
  user: any;
  profileData: any;
  setProfileData: (data: any) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nickname: "",
    language: [] as string[],
    hobbies: [] as string[],
    age: "",
    image: null as File | null,
  });

  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        ...prev,
        name: profileData.name || "",
        phone: profileData.phone || "",
        nickname: profileData.nickname || "",
        language: profileData.language || [],
        hobbies: profileData.hobbies || [],
        age: profileData.age || "",
      }));
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || "",
        phone: user.phone || "",
      }));
    }
  }, [profileData, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid File", {
          description: "Please select an image file",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File Too Large", {
          description: "Image size should be less than 5MB",
        });
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Validation Error", { description: "Name is required" });
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        nickname: formData.nickname,
        language: formData.language,
        hobbies: formData.hobbies,
        age: formData.age,
      };

      const response = await authApi.updateMyProfile(
        updateData,
        formData.image || undefined,
      );

      if (response.success) {
        toast.success(response.message || "Profile Updated Successfully");
        setFormData((prev) => ({ ...prev, image: null }));

        // Refetch profile data to get updated information
        const updatedProfile = await authApi.myProfile();
        setProfileData(updatedProfile.data);
      } else {
        const errorMessage =
          response.errorSources?.[0]?.message ||
          response.message ||
          "Failed to update profile";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errorSources?.[0]?.message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">User Name</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="focus-visible:ring-[#2E6F65] border-gray-300 rounded-lg h-12"
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Email</Label>
          <Input
            value={profileData?.email || user?.email || "admin@example.com"}
            disabled
            className="bg-gray-50 border-gray-300 rounded-lg h-12"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Contact Number</Label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="focus-visible:ring-[#2E6F65] border-gray-300 rounded-lg h-12"
            placeholder="Enter contact number"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Nickname</Label>
          <Input
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            className="focus-visible:ring-[#2E6F65] border-gray-300 rounded-lg h-12"
            placeholder="Enter nickname"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Age</Label>
        <Input
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          className="focus-visible:ring-[#2E6F65] border-gray-300 rounded-lg h-12"
          placeholder="Enter age"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">
          Languages (comma separated)
        </Label>
        <Input
          name="language"
          value={formData.language.join(", ")}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              language: e.target.value
                .split(",")
                .map((lang) => lang.trim())
                .filter((lang) => lang),
            }))
          }
          className="focus-visible:ring-[#2E6F65] border-gray-300 rounded-lg h-12"
          placeholder="e.g., Bangla, English, Hindi"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">
          Hobbies (comma separated)
        </Label>
        <Input
          name="hobbies"
          value={formData.hobbies.join(", ")}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              hobbies: e.target.value
                .split(",")
                .map((hobby) => hobby.trim())
                .filter((hobby) => hobby),
            }))
          }
          className="focus-visible:ring-[#2E6F65] border-gray-300 rounded-lg h-12"
          placeholder="e.g., coding, football, music"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Profile Image</Label>
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="cursor-pointer file:text-blue-500 border-gray-300 rounded-lg h-12"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className={`w-full ${buttonbg} cursor-pointer mt-6 h-12 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all`}
      >
        {isLoading ? "Updating..." : "Save Changes"}
      </Button>
    </form>
  );
}

function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShow = (field: keyof typeof showPass) => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.changePassword(
        formData.oldPassword,
        formData.newPassword,
      );

      if (response.success) {
        toast.success(response.message || "Password Changed Successfully");
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const errorMessage =
          response.errorSources?.[0]?.message ||
          response.message ||
          "Failed to change password";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errorSources?.[0]?.message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Old Password</Label>
        <div className="relative">
          <Input
            type={showPass.old ? "text" : "password"}
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            className="focus-visible:ring-[#2E6F65] border-gray-300 rounded-lg h-12 pr-12"
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => toggleShow("old")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPass.old ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">New Password</Label>
        <div className="relative">
          <Input
            type={showPass.new ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="focus-visible:ring-[#2E6F65] border-gray-300 rounded-lg h-12 pr-12"
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => toggleShow("new")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPass.new ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">
          Confirm New Password
        </Label>
        <div className="relative">
          <Input
            type={showPass.confirm ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="focus-visible:ring-[#2E6F65] border-gray-300 rounded-lg h-12 pr-12"
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => toggleShow("confirm")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPass.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className={`w-full ${buttonbg} cursor-pointer mt-6 h-12 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all`}
      >
        {isLoading ? "Updating..." : "Change Password"}
      </Button>
    </form>
  );
}
