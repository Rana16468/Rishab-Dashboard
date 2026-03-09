"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Ban,
  Search,
  X,
  Check,
  MoreVertical,
  Delete,
  DeleteIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg } from "@/contexts/theme";
import { userApi } from "@/redux/Api/userApi";
import { toast } from "sonner";

// Types
interface User {
  _id: string;
  name?: string;
  nickname: string;
  email?: string;
  phoneNumber?: string;
  isVerify: boolean;
  gender: string;
  hobbies: string[];
  role: string;
  status: string;
  photo: string | null;
  language: string[];
  age: string;
  isTramsAndConditions: boolean;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
  dataCenter?: string;
  verificationCode?: number;
  // Verification fields that are added after verification
  verifiedBy?: string;
  verifiedAt?: string;
  verificationToken?: string;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
    all_users: User[];
  };
}

// User Detail Modal Component
const UserDetailModal = ({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300">
        {/* Header with gradient background */}
        <div className="bg-linear-to-r from-[#5a005e] to-[#2d0552] p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name || user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#633cf0]">
                      {(user.name || user.nickname)?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {user.isVerify && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-3 border-white">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">
              {user?.name || user?.nickname || "Unknown User"}
            </h3>
            <p className="text-white/90 text-sm mb-2">
              {user?.email || user?.phoneNumber || "No contact info"}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.role}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.isVerify
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.isVerify ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </div>

        {/* Body with user information */}
        <div className="p-6 space-y-6">
          {/* Complete User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Basic Information
              </h5>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="font-medium text-gray-900">
                    {user?.id?.slice(-6) || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {user?.name || user?.nickname || "No name available"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nickname</p>
                  <p className="font-medium text-gray-900">
                    {user?.nickname || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      user?.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user?.role || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Contact Information
              </h5>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 text-sm break-all">
                    {user?.email || "example@example.com"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-900">
                    {user?.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Languages</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {user?.language?.length > 0
                      ? user.language.join(", ")
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Personal Details
              </h5>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {user?.gender || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">
                    {user?.age || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hobbies</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {user?.hobbies?.length > 0
                      ? user.hobbies.join(", ")
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Details - Show only if verified */}
            {user?.isVerify && (
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-green-200">
                <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Verification Details
                </h5>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Verified By</p>
                    <p className="font-medium text-gray-900">
                      {user?.verifiedBy || "System"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verified At</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {user?.verifiedAt
                        ? new Date(user.verifiedAt).toLocaleString()
                        : "Not available"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verification Code</p>
                    <p className="font-medium text-gray-900 text-xs break-all font-mono bg-white p-2 rounded border">
                      {user?.verificationCode || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* User Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                User Status
              </h5>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Current Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      user?.status === "blocked"
                        ? "bg-red-100 text-red-700"
                        : user?.status === "isProgress"
                          ? "bg-yellow-100 text-yellow-700"
                          : user?.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {user?.status === "blocked"
                      ? "Blocked"
                      : user?.status === "isProgress"
                        ? "In Progress"
                        : user?.status === "active"
                          ? "Active"
                          : user?.status || "Unknown"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status Description</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {user?.status === "blocked" &&
                      "User has been blocked and cannot access the system"}
                    {user?.status === "isProgress" &&
                      "User account is under review"}
                    {user?.status === "active" &&
                      "User account is active and fully functional"}
                    {!user?.status && "Status not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [adminCount, setAdminCount] = useState(0);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchUsers = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const response = await userApi.findAllUsersByAdmin(page, search);

      if (response.success) {
        // Get current user ID from token
        const token = localStorage.getItem("token");
        let currentUserId = null;

        if (token) {
          try {
            const tokenParts = token.split(".");
            if (tokenParts.length === 3) {
              const payload = atob(tokenParts[1]);
              const decodedToken = JSON.parse(payload);
              currentUserId = decodedToken.id;
            }
          } catch (error) {
            // Ignore token decoding errors
          }
        }

        // Filter users to show all users except the current logged-in user
        const allUsers = response.data.all_users;

        // Count admins from all users (before filtering out current user)
        const adminCountFromAll = allUsers.filter(
          (user: User) => user.role === "admin",
        ).length;
        setAdminCount(adminCountFromAll);

        // Additional validation to filter out blank or invalid users
        const validUsers = allUsers.filter(
          (user: User) =>
            user && user.id && user.nickname && user.id !== currentUserId,
        );

        setUsers(validUsers);
        setTotalPages(response.data.meta.totalPage);
        setTotalUsers(response.data.meta.total);
        setCurrentPage(response.data.meta.page);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, user, router]);

  // Effect to handle search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchUsers(1, searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page, searchQuery);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleVerifyUser = async (userId: string, userName: string) => {
    try {
      const response = await userApi.verifyUser(userId);

      if (response.success) {
        toast.success(`${userName} has been verified successfully!`);
        // Refresh the users list with current page and search to prevent blank user addition
        await fetchUsers(currentPage, searchQuery);
      } else {
        toast.error(response.message || "Failed to verify user");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify user");
    }
  };

  const handleUserStatusUpdate = async (
    userId: string,
    userName: string,
    status: "isProgress" | "blocked",
  ) => {
    try {
      console.log(`Updating user ${userName} (${userId}) to status: ${status}`);
      const response = await userApi.userStatusUpdate(userId, status);
      console.log("Status update API response:", response);

      if (response.success) {
        const statusText = status === "isProgress" ? "In Progress" : "Blocked";
        toast.success(`${userName} status has been updated to ${statusText}!`);
        // Refresh the users list
        await fetchUsers(currentPage, searchQuery);
      } else {
        console.log("Status update failed:", response.message);
        toast.error(response.message || "Failed to update user status");
      }
    } catch (error: any) {
      console.log("Status update error:", error);
      toast.error(error.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const response = await userApi.deleteUser(userId);

      if (response.success) {
        toast.success(`${userName} has been deleted successfully!`);
        // Refresh the users list
        await fetchUsers(currentPage, searchQuery);
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header Section */}
      <div
        className={`${buttonbg} rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}
      >
        <h1 className="text-2xl font-bold text-white">User List</h1>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search user name email phone or datacenter ..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white border-none h-11 text-gray-900 placeholder:text-gray-400 rounded-lg"
            />
          </div>

          {/* Blocked Users Button */}
          <Button
            onClick={() => setShowBlockedUsers(true)}
            className="bg-white text-[#2E6F65] hover:bg-white/90 font-semibold h-11 px-6 rounded-lg w-full sm:w-auto"
          >
            Blocked Users
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      {/* <div className="flex justify-end">
         <select className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm outline-none cursor-pointer hover:border-gray-300 transition-colors">
            <option>Date</option>
            <option>Name</option>
            <option>Status</option>
        </select>
      </div> */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
            <p className="text-gray-600">Total Users</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.isVerify).length}
            </h3>
            <p className="text-gray-600">Verified Users</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-blue-600">{adminCount}</h3>
            <p className="text-gray-600">Admins</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="text-[#58976B] font-semibold text-base py-5">
                  S.ID
                </TableHead>
                <TableHead className="text-[#58976B] font-semibold text-base py-5">
                  Full Name
                </TableHead>
                <TableHead className="text-[#58976B] font-semibold text-base py-5">
                  Email
                </TableHead>
                <TableHead className="text-[#58976B] font-semibold text-base py-5">
                  Phone No
                </TableHead>
                <TableHead className="text-[#58976B] font-semibold text-base py-5">
                  Verification
                </TableHead>
                <TableHead className="text-[#58976B] font-semibold text-base py-5">
                  Data Center
                </TableHead>
                <TableHead className="text-[#58976B] font-semibold text-base text-center py-5">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow
                    key={u.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="font-medium text-gray-600 py-4">
                      {u.id.slice(-6)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                          {u.photo ? (
                            <img
                              src={u.photo}
                              alt={u.name || u.nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-500">
                              {(u.name || u.nickname)?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 block">
                              {u.name || u.nickname}
                            </span>
                            {u.isVerify && (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500 capitalize">
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {u.email || u.phoneNumber || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {u.phoneNumber || "N/A"}
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.isVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.isVerify ? "Verified" : "Not Verified"}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {u.dataCenter || "N/A"}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsViewOpen(true);
                          }}
                          className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Show verify button only for unverified users */}
                        {!u.isVerify && (
                          <button
                            onClick={() => {
                              handleVerifyUser(u.id, u.name || u.nickname);
                            }}
                            className="text-green-500 hover:text-green-600 p-2 hover:bg-green-50 rounded-full transition-colors"
                            title="Verify User"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}

                        {/* Status dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setStatusDropdown(
                                statusDropdown === u.id ? null : u.id,
                              )
                            }
                            className="text-gray-500 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors"
                            title="More Options"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {statusDropdown === u.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleUserStatusUpdate(
                                      u.id,
                                      u.name || u.nickname,
                                      "isProgress",
                                    );
                                    setStatusDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                  Mark as In Progress
                                </button>
                                <button
                                  onClick={() => {
                                    handleUserStatusUpdate(
                                      u.id,
                                      u.name || u.nickname,
                                      "blocked",
                                    );
                                    setStatusDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                  Block User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setUserToDelete(u);
                            setIsDeleteOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete User"
                        >
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* User Stats */}

      {/* User Details Modal */}
      <UserDetailModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        user={selectedUser}
      />

      {/* Blocked Users Modal */}
      {showBlockedUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-linear-to-r from-red-600 to-red-800 p-6 rounded-t-2xl relative">
              <button
                onClick={() => setShowBlockedUsers(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white">Blocked Users</h2>
              <p className="text-white/90 text-sm mt-1">
                Users who have been blocked from accessing the system
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Blocked Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter((user) => user.status === "blocked")
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                {user.photo ? (
                                  <img
                                    src={user.photo}
                                    alt={user.name || user.nickname}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                    {(user.name || user.nickname)
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {user.name || user.nickname}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {user.id?.slice(-6)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {user.email || "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {user.phoneNumber || "N/A"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(user.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => {
                                handleUserStatusUpdate(
                                  user.id,
                                  user.name || user.nickname,
                                  "isProgress",
                                );
                              }}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Unblock
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {users.filter((user) => user.status === "blocked")
                      .length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          No blocked users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-linear-to-r from-red-600 to-red-800 p-6 rounded-t-2xl relative">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DeleteIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete User</h2>
                  <p className="text-white/90 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
                  {userToDelete?.photo ? (
                    <img
                      src={userToDelete.photo}
                      alt={userToDelete.name || userToDelete.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                      {(userToDelete?.name || userToDelete?.nickname)
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {userToDelete?.name || userToDelete?.nickname}
                  </p>
                  <p className="text-sm text-gray-500">
                    {userToDelete?.email ||
                      userToDelete?.phoneNumber ||
                      "No contact info"}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {userToDelete?.name || userToDelete?.nickname}
                </span>
                ? This will permanently remove their account and all associated
                data. This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (userToDelete) {
                      handleDeleteUser(
                        userToDelete.id,
                        userToDelete.name || userToDelete.nickname,
                      );
                      setIsDeleteOpen(false);
                      setUserToDelete(null);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
