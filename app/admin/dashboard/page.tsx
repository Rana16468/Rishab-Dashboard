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
import dashboardApi from "@/redux/Api/dashboardApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import UserGrowth from "./graph/userGroth";
import GameGraph from "./graph/gameGraph";
import ConversationGraph from "./graph/conversationGraph";

// Month names for mapping
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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
}

// Custom Modal for User Details
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
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
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Calculate max value for chart scaling
  const maxVal =
    chartData.length > 0 ? Math.max(...chartData.map((d) => d.users)) : 100;

  // Fetch dashboard stats
  const fetchStatsData = async () => {
    try {
      setStatsLoading(true);
      const response = await dashboardApi.graphStars();

      if (response.success) {
        setStatsData(response.data);
      } else {
        //
      }
    } catch (error) {
      //
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch recent users
  const fetchRecentUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching recent users...");
      const response = await dashboardApi.findAllUsersByAdminDashboard(1, "");
      console.log("API response:", response);

      if (response.success) {
        console.log("API successful, data:", response.data);
        // Get current user ID to exclude from list
        const token = localStorage.getItem("token");
        let currentUserId = null;

        if (token) {
          try {
            const tokenParts = token.split(".");
            if (tokenParts.length === 3) {
              const payload = atob(tokenParts[1]);
              const decodedToken = JSON.parse(payload);
              currentUserId = decodedToken.id;
              console.log("Current user ID:", currentUserId);
            }
          } catch (error) {
            console.log("Token decoding error:", error);
          }
        }

        // Filter out current user and take first 10 users
        const allUsers = response.data.all_users;
        console.log("All users from API:", allUsers);
        const filteredUsers = allUsers
          .filter((user: User) => user.id !== currentUserId)
          .slice(0, 10);

        console.log("Filtered users:", filteredUsers);
        setRecentUsers(filteredUsers);
      } else {
        console.log("API failed:", response.message);
      }
    } catch (error) {
      console.error("Failed to fetch recent users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chart data
  const fetchChartData = async (year: string = "2026") => {
    try {
      setChartLoading(true);

      const response = await dashboardApi.userGraph();

      if (response.success) {
        //
        const monthlyStats = response.data.monthlyStats;

        // Filter by selected year and transform data for chart
        const filteredStats = monthlyStats.filter(
          (stat: any) => stat.year.toString() === year,
        );
        const transformedData = filteredStats.map((stat: any) => ({
          month: monthNames[stat.month - 1] || `Month ${stat.month}`,
          users: stat.count || 0,
        }));

        setChartData(transformedData);
      } else {
        //
      }
    } catch (error) {
      //
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role?.toLowerCase() !== "admin") {
      router.push("/");
    } else {
      fetchStatsData();
      fetchRecentUsers();
      fetchChartData(selectedYear);
    }
  }, [isAuthenticated, user, router, selectedYear]);

  if (!user || user.role?.toLowerCase() !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {statsLoading ? "..." : statsData?.totalUser || "0"}
          </h2>
          <p className={`${textPrimary} font-medium`}>Users</p>
        </div>
        <div className="p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {statsLoading ? "..." : statsData?.totalUOT || "0"}
          </h2>
          <p className={`${textPrimary} font-medium`}>UOT Games</p>
        </div>
        <div className="p-8 flex flex-col items-center justify-center border-b border-gray-100 md:border-b-0">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {statsLoading ? "..." : statsData?.totalVF || "0"}
          </h2>
          <p className={`${textPrimary} font-medium`}>VF Games</p>
        </div>
        <div className="p-8 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {statsLoading ? "..." : statsData?.totalOcGame || "0"}
          </h2>
          <p className={`${textPrimary} font-medium`}>OC Games</p>
        </div>
      </div>
      <div className="grid grid-cols-1  gap-6">
        <GameGraph />
        <ConversationGraph />
        <UserGrowth />
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : recentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                recentUsers.map((u) => (
                  <TableRow
                    key={u.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="font-medium text-gray-600">
                      {u.id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                          {u.photo ? (
                            <img
                              src={u.photo}
                              alt={u.name || u.nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500">
                              {(u.name || u.nickname)?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {u.name || u.nickname}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {u.email || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {u.phoneNumber || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3">
                        {/* View Action Button */}

                        {/* Block Action Button */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
