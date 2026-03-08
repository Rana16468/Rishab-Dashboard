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

// Mock Data
const generateUsers = () => {
  return Array(8)
    .fill(null)
    .map((_, i) => ({
      id: "01",
      name: "Robert Fox",
      email: "fox@email",
      phone: "+123124",
      date: "02-24-2024",
      avatar: "/placeholder.png",
    }));
};

const usersData = generateUsers();

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

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [userToBlock, setUserToBlock] = useState<any>(null);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

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
              {usersData.map((u, i) => (
                <TableRow
                  key={i}
                  className="hover:bg-gray-50 border-b border-gray-100"
                >
                  <TableCell className="font-medium text-gray-600 py-4">
                    {i + 1}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-500">
                          {u.name.charAt(0)}
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">
                        {u.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 py-4">
                    {u.email}
                  </TableCell>
                  <TableCell className="text-gray-600 py-4">
                    {u.phone}
                  </TableCell>
                  <TableCell className="text-gray-600 py-4">{u.date}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setUserToBlock(u);
                          setIsBlockOpen(true);
                        }}
                        className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsViewOpen(true);
                        }}
                        className="text-[#58976B] hover:text-[#2E6F65] p-2 hover:bg-green-50 rounded-full transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        {/* <p className="text-[#58976B] text-sm font-medium">SHOWING 1-8 OF 250</p> */}

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className="text-gray-500 hover:text-[#2E6F65]"
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                isActive
                className="bg-[#2E6F65] text-white hover:bg-[#2E6F65]/90 hover:text-white border-0"
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                className="text-gray-600 hover:text-[#2E6F65] hover:bg-gray-100 border-0"
              >
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                className="text-gray-600 hover:text-[#2E6F65] hover:bg-gray-100 border-0"
              >
                3
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <span className="flex items-center justify-center h-9 w-9 text-gray-400">
                ...
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                className="text-gray-600 hover:text-[#2E6F65] hover:bg-gray-100 border-0"
              >
                30
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                className="text-gray-600 hover:text-[#2E6F65] hover:bg-gray-100 border-0"
              >
                60
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                className="text-gray-600 hover:text-[#2E6F65] hover:bg-gray-100 border-0"
              >
                120
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                className="text-gray-500 hover:text-[#2E6F65]"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* User Details Modal */}
      <UserDetailModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        user={selectedUser}
      />

      {/* Block User Alert Dialog */}
      <AlertDialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Block User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block{" "}
              <span className="font-bold text-gray-900">
                {userToBlock?.name}
              </span>
              ? They will lose access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToBlock(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Implement block logic here
                console.log("Blocking user:", userToBlock?.id);
                setIsBlockOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
