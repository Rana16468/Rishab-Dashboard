"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, Ban, X } from "lucide-react";
import { activeTabBG, buttonbg, textPrimary } from "@/contexts/theme";

// Mock Data for Chart
const chartData = [
  { month: "Jan", users: 680 },
  { month: "Feb", users: 380 },
  { month: "Mar", users: 780 },
  { month: "Apr", users: 550 },
  { month: "May", users: 440 },
  { month: "June", users: 820 },
  { month: "July", users: 550 },
  { month: "Aug", users: 600 },
  { month: "Sep", users: 820 },
  { month: "Oct", users: 720 },
  { month: "Nov", users: 550 },
  { month: "Dec", users: 780 },
];

const maxVal = Math.max(...chartData.map((d) => d.users));

// Mock Data for Users
const recentUsers = Array(6).fill({
  id: "01",
  name: "Robert Fox",
  email: "fox@email",
  phone: "+123124",
  date: "02-24-2024",
  avatar: "/placeholder-avatar.png", // We'll manage with a placeholder or fallback
});

// Custom Modal for User Details
const UserDetailModal = ({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: any }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden relative">
                {/* Placeholder Image */}
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-2xl font-bold">
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

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [userToBlock, setUserToBlock] = useState<any>(null);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">38.6K</h2>
          <p className={`${textPrimary} font-medium`}>Users</p>
        </div>
        <div className="p-8 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">4.9M</h2>
          <p className={`${textPrimary} font-medium`}>Total Revenue</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">User Ratio</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-3 h-3 rounded-full ${activeTabBG}`}></span>
              <span className="text-sm text-gray-500">Users</span>
            </div>
          </div>
          <select
            className={`${activeTabBG} text-gray-200 px-4 py-2 rounded-lg text-sm border-none outline-none cursor-pointer`}
          >
            <option>Year-2024</option>
            <option>Year-2023</option>
          </select>
        </div>

        {/* CSS Bar Chart */}
        <div className="relative h-[300px] w-full mt-10">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pointer-events-none">
            {[800, 600, 400, 200, 0].map((val) => (
              <div key={val} className="flex items-center w-full">
                <span className="w-10 text-right pr-2">{val.toFixed(2)}</span>
                <div className="h-[1px] flex-1 bg-gray-100 border-dashed border-gray-200"></div>
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex justify-between items-end pl-12 pr-4 pt-4">
            {chartData.map((data, index) => {
              const heightPercent = (data.users / 800) * 100;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-end gap-2 group w-full h-full"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 bg-[#FCD34D] text-[#0D0D0D] text-xs py-1 px-3 rounded shadow-sm mb-2 z-10 pointer-events-none whitespace-nowrap">
                    <p className="font-bold">Users</p>
                    <p>{data.users}</p>
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#FCD34D]"></div>
                  </div>

                  <div
                    style={{
                      height: `${heightPercent > 100 ? 100 : heightPercent}%`,
                    }}
                    className={`w-3 sm:w-4 md:w-8 ${activeTabBG} rounded-t-sm transition-all duration-300 hover:opacity-80 relative`}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-t-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className={` p-6 pb-4  ${buttonbg} text-white hover:bg-[#58976B]/90`}
        >
          <h2 className="text-xl font-bold">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={` text-black bg-white hover:bg-`}>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-black font-semibold">S.ID</TableHead>
                <TableHead className="text-black font-semibold">
                  Full Name
                </TableHead>
                <TableHead className="text-black font-semibold">
                  Email
                </TableHead>
                <TableHead className="text-black font-semibold">
                  Phone No
                </TableHead>
                <TableHead className="text-black font-semibold">
                  Joined Date
                </TableHead>
                <TableHead className="text-black font-semibold text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((u, i) => (
                <TableRow
                  key={i}
                  className="hover:bg-gray-50 border-b border-gray-100"
                >
                  <TableCell className="font-medium text-gray-600">
                    {u.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                        {/* Avatar Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500">
                          {u.name.charAt(0)}
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">
                        {u.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{u.email}</TableCell>
                  <TableCell className="text-gray-600">{u.phone}</TableCell>
                  <TableCell className="text-gray-600">{u.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      {/* Block Action Button */}
                      <button
                        onClick={() => {
                          setUserToBlock(u);
                          setIsBlockOpen(true);
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                      >
                        <Ban className="w-5 h-5" />
                      </button>

                      {/* View Action Button */}
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsViewOpen(true);
                        }}
                        className="text-[#2E6F65] hover:text-[#58976B] hover:bg-green-50 p-2 rounded-full transition-colors"
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

      {/* User Details Modal */}
      <UserDetailModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        user={selectedUser}
      />

      {/* Block User Alert Dialog - Single Instance */}
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