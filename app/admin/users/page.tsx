"use client";

import { useState, useEffect } from "react";
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
import { Eye, Ban, Search, X } from "lucide-react";
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
  user: any;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xl font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#2E6F65]">{user?.name}</h3>
          <p className="text-sm text-gray-500 mb-6">{user?.email}</p>

          <div className="space-y-3 text-left">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium">{user?.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Joined Date</span>
              <span className="font-medium">{user?.date}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-green-600">Active</span>
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

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await userApi.findAllUsersByAdmin(page);

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
            console.error("Error decoding token:", error);
          }
        }

        // Filter users to show all users except the current logged-in user
        const allUsers = response.data.all_users;
        const filteredByToken = currentUserId
          ? allUsers.filter((user: User) => user.id !== currentUserId)
          : allUsers;

        setUsers(filteredByToken);
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.includes(searchQuery),
  );

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
              placeholder="Search User"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-none h-11 text-gray-900 placeholder:text-gray-400 rounded-lg"
            />
          </div>

          {/* Blocked Users Button */}
          <Button className="bg-white text-[#2E6F65] hover:bg-white/90 font-semibold h-11 px-6 rounded-lg w-full sm:w-auto">
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
            <h3 className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.role === "admin").length}
            </h3>
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
                  Joined Date
                </TableHead>
                <TableHead className="text-[#58976B] font-semibold text-base text-center py-5">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
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
                          <span className="font-medium text-gray-900 block">
                            {u.name || u.nickname}
                          </span>
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
                    <TableCell className="text-gray-600 py-4">
                      {new Date(u.createdAt).toLocaleDateString()}
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
                        <button
                          onClick={() => {
                            setUserToBlock(u);
                            setIsBlockOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Ban className="w-5 h-5" />
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

      {/* Block User Alert Dialog */}
      <AlertDialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block{" "}
              {userToBlock?.name || userToBlock?.nickname}? This action can be
              reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
