"use client";

import { useState, useEffect, useRef } from "react";
import { userApi } from "@/redux/Api/userApi";
import conversationApi from "@/redux/Api/conversationApi";
import { BASE_URL } from "@/redux/Api/baseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Search,
  MessageCircle,
  Users,
  Filter,
  X,
  Clock,
  User,
  Brain,
  Heart,
  AlertTriangle,
  Calendar,
  FileAudio,
  Tag,
  Download,
  Play,
  Pause,
  Delete,
} from "lucide-react";
import * as XLSX from "xlsx";

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
  verifiedBy?: string;
  verifiedAt?: string;
  verificationToken?: string;
}

interface Conversation {
  _id: string;
  userText: string;
  reply: string;
  userId: {
    _id: string;
    nickname: string;
    photo: string;
    name: string;
    id: string;
    email?: string;
    phoneNumber?: string;
  };
  question_category: string;
  conversation_topic: string;
  icope_health_trigger: boolean;
  mental_distress: boolean;
  summary: string;
  audio_file: string;
  pdf_file?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConversationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [showConversationsModal, setShowConversationsModal] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [conversationCurrentPage, setConversationCurrentPage] = useState(1);
  const [conversationTotalPages, setConversationTotalPages] = useState(1);
  const [totalConversations, setTotalConversations] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.findAllUsersByAdmin(
        currentPage,
        searchTerm,
      );
      if (response?.success) {
        setUsers(response.data.all_users || []);
        setTotalPages(response.data.meta.totalPage || 1);
        setTotalUsers(response.data.meta.total || 0);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch {
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleUserAction = async (userId: string, page: number = 1) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setSelectedUser(user);
    setShowConversationsModal(true);
    setConversationsLoading(true);

    try {
      const response = await conversationApi.findAllConversationsByUser(
        userId,
        page,
        10,
      );

      if (response && response.all_conversation_memories) {
        setConversations(response.all_conversation_memories);
        setConversationTotalPages(response.meta.totalPage || 1);
        setTotalConversations(response.meta.total || 0);
        setConversationCurrentPage(response.meta.page || 1);
      } else {
        setConversations([]);
        setConversationTotalPages(1);
        setTotalConversations(0);
      }
    } catch {
      setConversations([]);
      setConversationTotalPages(1);
      setTotalConversations(0);
    } finally {
      setConversationsLoading(false);
    }
  };

  const handlePlayAudio = (convId: string) => {
    const currentAudio = audioRefs.current[convId];

    if (!currentAudio) return;

    if (playingAudioId === convId) {
      currentAudio.pause();
      setPlayingAudioId(null);
    } else {
      // Pause other audios
      Object.values(audioRefs.current).forEach((audio) => audio?.pause());
      currentAudio.play();
      setPlayingAudioId(convId);
    }
  };

  const handleDownloadPDF = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  const handleDeleteConversation = async (conversationId: string) => {
    setConversationToDelete(conversationId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      await conversationApi.deleteConversationByConversetionId(
        conversationToDelete,
      );

      // Refresh conversations if we have a selected user
      if (selectedUser) {
        handleUserAction(selectedUser.id, conversationCurrentPage);
      }

      // Reset modal state
      setShowDeleteConfirmModal(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      setErrorMessage("Failed to delete conversation. Please try again.");
      setShowErrorModal(true);
      setShowDeleteConfirmModal(false);
      setConversationToDelete(null);
    }
  };

  const handleDownloadAllInfo = (conversation: Conversation) => {
    // Prepare data for XLSX
    const data = [
      ["Conversation Report"],
      ["Generated on", new Date().toLocaleString()],
      [],
      ["User Information"],
      ["Name", conversation.userId.name || conversation.userId.nickname],
      ["Email", conversation.userId.email || "Not provided"],
      ["Phone", conversation.userId.phoneNumber || "Not provided"],
      ["User ID", conversation.userId.id],
      [],
      ["Conversation Details"],
      ["Topic", conversation.conversation_topic],
      ["Category", conversation.question_category],
      ["Date", new Date(conversation.createdAt).toLocaleString()],
      ["Question", conversation.userText],
      ["Reply", conversation.reply],
      [],
      ["AI Summary"],
      [conversation.summary || "No summary available"],
      [],
      ["Media Information"],
      [
        "Audio File",
        conversation.audio_file
          ? `${BASE_URL}/${conversation.audio_file}`
          : "Not available",
      ],
      ["PDF File", conversation.pdf_file || "Not available"],
      [],
      ["Health Indicators"],
      [
        "ICope Health Trigger",
        conversation.icope_health_trigger ? "Yes" : "No",
      ],
      ["Mental Distress", conversation.mental_distress ? "Yes" : "No"],
      [],
      ["Metadata"],
      ["Conversation ID", conversation._id],
      ["Created At", conversation.createdAt],
      ["Updated At", conversation.updatedAt],
      ["Status", conversation.isDeleted ? "Deleted" : "Active"],
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Conversation Report");

    // Generate filename
    const userName = (conversation.userId.name || conversation.userId.nickname)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const fileName = `conversation_${userName}_${conversation._id.slice(-6)}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, fileName);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-[#9807db] to-[#9807db] rounded-xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Conversations
            </h1>
            <p className="text-gray-500 mt-1">
              {totalUsers > 0 ? `${totalUsers} users found` : "No users found"}
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-initial lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search users by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-gray-200 focus:border-[#9807db] focus:ring-[#9807db]"
            />
          </div>
          <Button
            type="submit"
            className="bg-gradient-to-r from-[#9807db] to-[#9807db] hover:opacity-90 text-white h-11 px-6 shadow-md transition-all"
          >
            <Filter className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-[#2E6F65] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalUsers}
                </p>
              </div>
              <div className="p-3 bg-[#2E6F65]/10 rounded-lg">
                <Users className="w-6 h-6 text-[#9807db]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#9807db] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Verified Users
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {users.filter((user) => user.isVerify).length}
                </p>
              </div>
              <div className="p-3 bg-[#58976B]/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-[#9807db]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Page
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {currentPage} / {totalPages}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Filter className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#9807db] to-[#9807db] rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            User List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  User Information
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Role
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Contact Details
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#2E6F65] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500">Loading users...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-16 h-16 text-gray-300" />
                      <p className="text-gray-500 font-medium text-lg">
                        No users found
                      </p>
                      <p className="text-gray-400">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#522e6f] to-[#9807db] flex items-center justify-center text-white font-semibold text-lg shadow-md">
                          {(user.name || user.nickname || "U")
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name || user.nickname || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {user.id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "destructive"
                            : user.role === "moderator"
                              ? "secondary"
                              : "default"
                        }
                        className="capitalize"
                      >
                        {user.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.phoneNumber && (
                          <p className="text-sm text-gray-900 flex items-center gap-1">
                            📱 {user.phoneNumber}
                          </p>
                        )}
                        {user.email && (
                          <p
                            className="text-xs text-gray-500 truncate max-w-50"
                            title={user.email}
                          >
                            📧 {user.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${user.isVerify ? "bg-purple-500" : "bg-red-500"}`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${user.isVerify ? "text-purple-700" : "text-red-700"}`}
                        >
                          {user.isVerify ? "Verified" : "Not Verified"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleUserAction(user.id)}
                        className="bg-gradient-to-r from-[#4c2e6f] to-[#6e5897] hover:opacity-90 text-white shadow-md transition-all"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-gray-100"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-gray-100"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Conversations Modal */}
      {/* Chat History Modal */}
      {showConversationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-[50vw] max-w-none max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-[#5f17d4] to-[#6557b9] rounded-xl shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Chat History
                    </h2>
                    <p className="flex items-center gap-2 text-gray-600 mt-1">
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {selectedUser?.name ||
                          selectedUser?.nickname ||
                          "Unknown User"}
                      </span>
                      {selectedUser?.email && (
                        <span className="text-gray-400">
                          • {selectedUser.email}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {totalConversations} conversations
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto  max-h-[70vh] p-5">
              {conversationsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-[#4d33be] border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium text-lg">
                      Loading conversations...
                    </p>
                    <p className="text-gray-400">
                      Please wait while we fetch the chat history
                    </p>
                  </div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-12 h-12 text-gray-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium text-xl">
                      No conversations found
                    </p>
                    <p className="text-gray-400">
                      This user hasn't had any conversations yet
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {conversations.map((conv) => (
                    <Card
                      key={conv._id}
                      className="border-l-4 border-l-[#7507be] shadow-md hover:shadow-lg transition-all"
                    >
                      <CardContent className="p-6">
                        {/* Header with User Info and Timestamp */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8738e2] to-[#693fdd] flex items-center justify-center text-white font-semibold text-lg shadow-md ring-2 ring-gray-300">
                              {conv.userId.photo ? (
                                <img
                                  src={conv.userId.photo || "/ami.png"}
                                  alt={
                                    conv.userId.name ||
                                    conv.userId.nickname ||
                                    "User"
                                  }
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement!.textContent =
                                      (
                                        conv.userId.name ||
                                        conv.userId.nickname ||
                                        "U"
                                      )
                                        ?.charAt(0)
                                        ?.toUpperCase();
                                  }}
                                />
                              ) : (
                                <span>
                                  {(
                                    conv.userId.name ||
                                    conv.userId.nickname ||
                                    "U"
                                  )
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {conv.userId.name || conv.userId.nickname}
                              </p>
                              <p className="text-sm text-gray-500">
                                {conv.userId.email || conv.userId.phoneNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 font-medium">
                              {formatDate(conv.createdAt)}
                            </div>
                            <div className="flex gap-2 mt-2">
                              {conv.icope_health_trigger && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs flex items-center gap-1"
                                >
                                  <Heart className="w-3 h-3" /> Health
                                </Badge>
                              )}
                              {conv.mental_distress && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs flex items-center gap-1"
                                >
                                  <Brain className="w-3 h-3" /> Mental
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="text-xs flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" />{" "}
                                {conv.question_category}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Topic */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-gray-100 rounded">
                              <Tag className="w-4 h-4 text-gray-600" />
                            </div>
                            <h4 className="font-semibold text-gray-800">
                              Conversation Topic
                            </h4>
                          </div>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
                            {conv.conversation_topic}
                          </p>
                        </div>

                        {/* User Message */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-100 rounded">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-blue-800">
                              User Message
                            </h4>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-gray-700 leading-relaxed">
                              {conv.userText}
                            </p>
                          </div>
                        </div>

                        {/* AI Reply */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-green-100 rounded">
                              <MessageCircle className="w-4 h-4 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-purple-800">
                              Assistant Response
                            </h4>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-gray-700 leading-relaxed">
                              {conv.reply}
                            </p>
                          </div>
                        </div>

                        {/* AI Summary */}
                        {conv.summary && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-blue-100 rounded">
                                <Brain className="w-4 h-4 text-blue-600" />
                              </div>
                              <h4 className="font-semibold text-blue-800">
                                AI Summary
                              </h4>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {conv.summary}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Audio Player */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const possiblePaths = [
                                `${BASE_URL}/src/public/audios/${conv.audio_file}`,
                                `${BASE_URL}/public/audios/${conv.audio_file}`,
                                `${BASE_URL}/audios/${conv.audio_file}`,
                                `${BASE_URL}/${conv.audio_file}`,
                              ];

                              return (
                                <audio
                                  ref={(el) => {
                                    if (el) {
                                      audioRefs.current[conv._id] = el;

                                      // Try each path until one works
                                      let currentPathIndex = 0;
                                      const tryNextPath = () => {
                                        if (
                                          currentPathIndex <
                                          possiblePaths.length
                                        ) {
                                          el.src =
                                            possiblePaths[currentPathIndex];
                                          currentPathIndex++;
                                        }
                                      };

                                      el.addEventListener("error", () => {
                                        tryNextPath();
                                      });

                                      // Start with first path
                                      tryNextPath();
                                    }
                                  }}
                                  controls
                                  preload="metadata"
                                  className="flex-1 h-10"
                                  onError={(e) => {
                                    // Handle audio errors silently
                                  }}
                                  onLoadStart={() => {
                                    // Handle load start silently
                                  }}
                                  onCanPlay={() => {
                                    // Handle can play silently
                                  }}
                                />
                              );
                            })()}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePlayAudio(conv._id)}
                              className="shrink-0"
                            >
                              {playingAudioId === conv._id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            {conv.pdf_file && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDownloadPDF(
                                    `${BASE_URL}${conv.pdf_file}`,
                                  )
                                }
                                className="shrink-0"
                              >
                                <Download className="w-4 h-4" /> PDF
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadAllInfo(conv)}
                              className="shrink-0 bg-green-50 hover:bg-green-100 border-green-200"
                            >
                              <Download className="w-4 h-4" /> All Info
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteConversation(conv._id)}
                              className="shrink-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
                            >
                              <Delete className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-gray-500">
                  {conversations.length > 0 && (
                    <span>
                      Showing {conversations.length} of {totalConversations}{" "}
                      conversation{totalConversations !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {conversationTotalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => {
                              if (conversationCurrentPage > 1 && selectedUser) {
                                handleUserAction(
                                  selectedUser.id,
                                  conversationCurrentPage - 1,
                                );
                              }
                            }}
                            className={
                              conversationCurrentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer hover:bg-gray-100"
                            }
                          />
                        </PaginationItem>

                        {Array.from(
                          { length: Math.min(5, conversationTotalPages) },
                          (_, i) => {
                            let pageNum;
                            if (conversationTotalPages <= 5) {
                              pageNum = i + 1;
                            } else if (conversationCurrentPage <= 3) {
                              pageNum = i + 1;
                            } else if (
                              conversationCurrentPage >=
                              conversationTotalPages - 2
                            ) {
                              pageNum = conversationTotalPages - 4 + i;
                            } else {
                              pageNum = conversationCurrentPage - 2 + i;
                            }
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => {
                                    if (selectedUser) {
                                      handleUserAction(
                                        selectedUser.id,
                                        pageNum,
                                      );
                                    }
                                  }}
                                  isActive={conversationCurrentPage === pageNum}
                                  className="cursor-pointer hover:bg-gray-100"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          },
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => {
                              if (
                                conversationCurrentPage <
                                  conversationTotalPages &&
                                selectedUser
                              ) {
                                handleUserAction(
                                  selectedUser.id,
                                  conversationCurrentPage + 1,
                                );
                              }
                            }}
                            className={
                              conversationCurrentPage === conversationTotalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer hover:bg-gray-100"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                  <Button
                    onClick={() => setShowConversationsModal(false)}
                    className="bg-gradient-to-r from-[#8106e6] to-[#693be7] text-white hover:opacity-90"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">Error</h3>
            </div>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <div className="text-right">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Delete className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setConversationToDelete(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteConversation}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
