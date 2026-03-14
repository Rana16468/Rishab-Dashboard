"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Trash2,
  Edit,
  Eye,
  FileText,
  Search,
  Download,
  Delete,
  X,
} from "lucide-react";
import { buttonbg, textPrimary } from "@/contexts/theme";
import userResearchApi from "@/redux/Api/userResearchApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ContentsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    sessionId: string | null;
  }>({ show: false, sessionId: null });

  // Function to delete a research session
  const deleteResearchSession = async (sessionId: string) => {
    setDeleteConfirm({ show: true, sessionId });
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    if (deleteConfirm.sessionId) {
      try {
        await userResearchApi.deleteResearcherUser(deleteConfirm.sessionId);
        // Refresh the data after deletion
        fetchResearchData();
        console.log(`Session ${deleteConfirm.sessionId} deleted successfully`);
        setDeleteConfirm({ show: false, sessionId: null });
      } catch (error) {
        console.error("Delete error:", error);
        // You can show an error toast here if needed
      }
    }
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, sessionId: null });
  };

  // Function to download all current page data as Excel (row by row format)
  const downloadAllCurrentPageAsExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Simple row-by-row data format
    const rowData = contents.map((item, index) => ({
      "SL No": index + 1,
      "Session ID": item.originalData?.sessionId || "",
      "Game Mode": item.originalData?.gameMode || "",
      "User ID": item.originalData?.user?.userId || "",
      Nickname: item.originalData?.user?.nickname || "",
      Age: item.originalData?.user?.age || "",
      Gender: item.originalData?.user?.gender || "",
      Hobbies: item.originalData?.user?.hobbies?.join(", ") || "",
      Languages: item.originalData?.user?.language?.join(", ") || "",
      Difficulty: item.originalData?.gameData?.difficulty || "",
      Stage: item.originalData?.gameData?.stage || "",
      "Completion Time": item.originalData?.gameData?.completionTime || "",
      "Hints Used": item.originalData?.gameData?.metrics?.totalHintsUsed || "",
      "Accuracy %":
        item.originalData?.gameData?.metrics?.accuracyPercentage || "",
      Instruction: item.originalData?.gameData?.metrics?.instructionText || "",
      "Total Clicks": item.originalData?.gameData?.rawTileClicks?.length || 0,
      "Correct Clicks":
        item.originalData?.gameData?.rawTileClicks?.filter(
          (click: any) => click.wasCorrect,
        ).length || 0,
      "Incorrect Clicks":
        item.originalData?.gameData?.rawTileClicks?.filter(
          (click: any) => !click.wasCorrect,
        ).length || 0,
      "Average Click Time": item.averageClickTime || "",
      Status: item.originalData?.gameData?.completionTime
        ? "Completed"
        : "Incomplete",
    }));

    // Create worksheet from row data
    const ws = XLSX.utils.json_to_sheet(rowData);

    // Set column widths
    ws["!cols"] = [
      { wch: 8 }, // SL No
      { wch: 15 }, // Session ID
      { wch: 12 }, // Game Mode
      { wch: 15 }, // User ID
      { wch: 20 }, // Nickname
      { wch: 8 }, // Age
      { wch: 10 }, // Gender
      { wch: 25 }, // Hobbies
      { wch: 20 }, // Languages
      { wch: 12 }, // Difficulty
      { wch: 8 }, // Stage
      { wch: 15 }, // Completion Time
      { wch: 12 }, // Hints Used
      { wch: 12 }, // Accuracy %
      { wch: 30 }, // Instruction
      { wch: 15 }, // Total Clicks
      { wch: 15 }, // Correct Clicks
      { wch: 18 }, // Incorrect Clicks
      { wch: 18 }, // Average Click Time
      { wch: 12 }, // Status
    ];

    // Style header row
    const headerRange = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "D4E6F1" } },
        };
      }
    }

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Research Data");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Download file
    const fileName = `Research_Data_Page_${page}_${new Date().toISOString().split("T")[0]}.xlsx`;
    saveAs(blob, fileName);
  };

  const downloadSessionAsExcel = (sessionData: any) => {
    if (!sessionData) return;

    const wb = XLSX.utils.book_new();

    /* ==============================
     1️⃣ Session Summary Sheet
  ============================== */

    const summaryData = [
      ["Session ID", sessionData.sessionId || ""],
      ["Game Mode", sessionData.gameMode || ""],
      ["User ID", sessionData.user?.userId || ""],
      ["Nickname", sessionData.user?.nickname || ""],
      ["Age", sessionData.user?.age || ""],
      ["Gender", sessionData.user?.gender || ""],
      ["Hobbies", (sessionData.user?.hobbies || []).join(", ")],
      ["Languages", (sessionData.user?.language || []).join(", ")],
      ["Difficulty", sessionData.gameData?.difficulty || ""],
      ["Stage", sessionData.gameData?.stage || ""],
      ["Completion Time", sessionData.gameData?.completionTime || ""],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

    wsSummary["!cols"] = [{ wch: 25 }, { wch: 50 }];

    XLSX.utils.book_append_sheet(wb, wsSummary, "Session Summary");

    /* ==============================
     2️⃣ Click Details Sheet
  ============================== */

    const clickHeaders = [
      "Click No",
      "Sprite Name",
      "Correct",
      "Response Time",
    ];

    const clickData =
      sessionData.gameData?.rawTileClicks?.map((click: any, index: number) => [
        index + 1,
        click.spriteName || "",
        click.wasCorrect ? "Yes" : "No",
        click.clickTime || "",
      ]) || [];

    const wsClicks = XLSX.utils.aoa_to_sheet([clickHeaders, ...clickData]);

    wsClicks["!cols"] = [{ wch: 10 }, { wch: 30 }, { wch: 10 }, { wch: 20 }];

    wsClicks["!autofilter"] = {
      ref: "A1:D1",
    };

    XLSX.utils.book_append_sheet(wb, wsClicks, "Click Details");

    /* ==============================
     3️⃣ Conversation Logs Sheet
  ============================== */

    const conversationHeaders = [
      "UserID",
      "ChatId",
      "ChatSessionId",
      "timestampUtc",
      "role",
      "type",
      "category",
      "conversationTop",
      "language",
      "audioPath",
      "durationSeconds",
      "timings",
      "message",
    ];

    const conversationData =
      sessionData.conversations?.map((msg: any) => [
        msg.userId || "",
        msg.chatId || "",
        msg.chatSessionId || "",
        msg.timestampUtc || "",
        msg.role || "",
        msg.type || "",
        msg.category || "",
        msg.conversationTop || "",
        msg.language || "",
        msg.audioPath || "",
        msg.durationSeconds || "",
        JSON.stringify(msg.timings || {}),
        msg.message || "",
      ]) || [];

    const wsConversation = XLSX.utils.aoa_to_sheet([
      conversationHeaders,
      ...conversationData,
    ]);

    wsConversation["!cols"] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 30 },
      { wch: 25 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 80 },
    ];

    wsConversation["!autofilter"] = {
      ref: "A1:M1",
    };

    XLSX.utils.book_append_sheet(wb, wsConversation, "Conversation Logs");

    /* ==============================
     4️⃣ File Download
  ============================== */

    const fileName = `session_${sessionData.sessionId || "data"}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const fetchResearchData = async () => {
    try {
      setLoading(true);

      const response = await userResearchApi.getResearcherUsers({
        page,
        limit,
        searchTerm: searchTerm || undefined,
      });

      console.log("Full API Response:", response);

      const sessions = response?.data?.result?.[0]?.data ?? [];
      const total = response?.data?.result?.[0]?.meta?.[0]?.total || 0;

      // Update pagination info
      setTotalItems(total);
      setTotalPages(Math.ceil(total / limit));

      const processed = sessions.map((session: any, index: number) => {
        const userData = session.user || {};
        const gameData = session.gameData || {};
        const metrics = gameData.metrics || {};
        const rawClicks = gameData.rawTileClicks || [];

        return {
          id: session.sessionId,
          title: `Session ${index + 1}`,
          gameModeFullMeaning: session.gameModeFullMeaning,
          category:
            session.gameMode === "OC"
              ? ""
              : session.gameMode === "UOT"
                ? ""
                : session.gameMode === "VF"
                  ? ""
                  : "",
          author: userData.nickname || "Unknown",
          date: new Date().toISOString().split("T")[0],
          status: gameData.completionTime ? "Completed" : "Incomplete",
          // Store original session data for detailed view
          originalData: session,
          // Display fields
          hobbies: userData.hobbies ? userData.hobbies.join(", ") : "Unknown",
          languages: userData.language
            ? userData.language.join(", ")
            : "Unknown",
          // Game Details
          gameMode: session.gameMode || "Unknown",
          difficulty: gameData.difficulty || "Unknown",
          stage: gameData.stage || "Unknown",
          completionTime: gameData.completionTime
            ? `${gameData.completionTime}s`
            : "N/A",
          // Performance Metrics
          accuracy:
            metrics.accuracyPercentage !== undefined
              ? `${metrics.accuracyPercentage}%`
              : "N/A",
          hintsUsed: metrics.totalHintsUsed || 0,
          instruction: metrics.instructionText || "N/A",
          // Interaction Data
          totalClicks: rawClicks.length,
          correctClicks: rawClicks.filter((click: any) => click.wasCorrect)
            .length,
          incorrectClicks: rawClicks.filter((click: any) => !click.wasCorrect)
            .length,
          averageClickTime:
            rawClicks.length > 0
              ? `${(rawClicks.reduce((sum: number, click: any) => sum + click.clickTime, 0) / rawClicks.length).toFixed(2)}s`
              : "N/A",
          // Raw Clicks Details
          rawClicksDetails: rawClicks
            .map(
              (click: any) =>
                `${click.spriteName} (${click.wasCorrect ? "✓" : "✗"}) - ${click.clickTime}s`,
            )
            .join(" | "),
        };
      });

      setContents(processed);
    } catch (error) {
      console.error("Fetch error:", error);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchResearchData();
    }
  }, [page, limit, searchTerm, isAuthenticated, user]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      {/* Header */}
      <div
        className={`${buttonbg} rounded-xl p-4 px-6 shadow-sm flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Research Sessions</h1>
        </div>
        <Button
          onClick={downloadAllCurrentPageAsExcel}
          className="bg-white text-[#2E6F65] hover:bg-white/90 font-bold"
        >
          <h2>Download all</h2>
          <Download className="w-5 h-5" />
        </Button>
      </div>

      {/* Search Field */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by game mode, user ID, nickname..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <Button
            onClick={() => fetchResearchData()}
            className={`${buttonbg} hover:bg-blue-700 text-white px-6 py-2 rounded-lg`}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Content Table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col justify-between">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-b border-[#2E6F65] hover:bg-transparent">
                  <TableHead
                    className={`font-semibold text-base py-5 ${textPrimary} pl-6`}
                  >
                    Game Mode
                  </TableHead>
                  <TableHead
                    className={`font-semibold text-base py-5 ${textPrimary}`}
                  >
                    User Details
                  </TableHead>
                  <TableHead
                    className={`font-semibold text-base py-5 ${textPrimary}`}
                  >
                    Hobbies
                  </TableHead>
                  <TableHead
                    className={`font-semibold text-base py-5 ${textPrimary}`}
                  >
                    Languages
                  </TableHead>
                  <TableHead
                    className={`font-semibold text-base py-5 ${textPrimary}`}
                  >
                    Difficulty
                  </TableHead>
                  <TableHead
                    className={`font-semibold text-base py-5 ${textPrimary}`}
                  >
                    Accuracy
                  </TableHead>
                  <TableHead
                    className={`font-semibold text-base py-5 ${textPrimary}`}
                  >
                    Time
                  </TableHead>
                  <TableHead
                    className={`font-semibold text-base py-5 ${textPrimary}`}
                  >
                    Clicks
                  </TableHead>
                  <TableHead
                    className={`font-semibold text-base py-5 ${textPrimary} text-right pr-6`}
                  >
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-600">
                          No research data found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm
                            ? "No results match your search criteria"
                            : "No research sessions have been recorded yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  contents.map((item, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <TableCell className="text-gray-900 font-medium py-4 pl-6">
                        {item.gameModeFullMeaning || "-"}
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{item.author}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4 text-sm">
                        {item.hobbies}
                      </TableCell>
                      <TableCell className="text-gray-600 py-4 text-sm">
                        {item.languages}
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        <div className="text-sm">
                          <div>Level {item.difficulty}</div>
                          <div className="text-gray-400">
                            Stage {item.stage}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{item.accuracy}</div>
                          <div className="text-gray-400">
                            {item.hintsUsed} hints
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        <div className="text-sm">
                          <div>{item.completionTime}</div>
                          <div className="text-gray-400">
                            {item.averageClickTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        <div className="text-sm">
                          <div>{item.totalClicks} total</div>
                          <div className="text-green-600">
                            {item.correctClicks} ✓
                          </div>
                          <div className="text-red-600">
                            {item.incorrectClicks} ✗
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 pr-6">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setSelectedSession(item.originalData);
                              setShowDetails(true);
                            }}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() =>
                              downloadSessionAsExcel(item.originalData)
                            }
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="Download as Excel"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              deleteResearchSession(item.originalData.sessionId)
                            }
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete session"
                          >
                            <Delete className="w-5 h-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="bg-linear-to-br from-gray-50 to-gray-100 p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Left Side - Info and Limit Selector */}
              <div className="flex items-center gap-6">
                {/* Results Info */}
                <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
                  <span className="text-sm font-medium text-gray-700">
                    <span className="text-[#2E6F65] font-bold">
                      {(page - 1) * limit + 1}-
                      {Math.min(page * limit, totalItems)}
                    </span>
                    <span className="text-gray-500"> of </span>
                    <span className="text-[#2E6F65] font-bold">
                      {totalItems}
                    </span>
                    <span className="text-gray-500"> results</span>
                  </span>
                </div>

                {/* Limit Selector */}
                <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
                  <label className="text-sm font-medium text-gray-700">
                    Items per page:
                  </label>
                  <div className="relative">
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="appearance-none bg-[#8410d1] text-white rounded-md px-3 py-1 pr-8 text-sm font-medium cursor-pointer hover:bg-[#2E6F65]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E6F65]/50"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Page Navigation */}
              <div className="flex items-center gap-2">
                <Pagination className="flex items-center gap-1">
                  <PaginationContent className="flex items-center gap-1">
                    {/* Previous Button */}
                    <PaginationItem>
                      <button
                        onClick={() => page > 1 && setPage(page - 1)}
                        disabled={page === 1}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          page === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-[#502e6f] hover:text-white border border-gray-200 shadow-sm hover:shadow-md"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </button>
                    </PaginationItem>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <PaginationItem key={pageNum}>
                              <button
                                onClick={() => setPage(pageNum)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                                  page === pageNum
                                    ? "bg-[#5d2e6f] text-white shadow-md"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                }`}
                              >
                                {pageNum}
                              </button>
                            </PaginationItem>
                          );
                        },
                      )}

                      {/* Ellipsis */}
                      {totalPages > 5 && page < totalPages - 2 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                    </div>

                    {/* Next Button */}
                    <PaginationItem>
                      <button
                        onClick={() => page < totalPages && setPage(page + 1)}
                        disabled={page === totalPages}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          page === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-[#8410c7] hover:text-white border border-gray-200 shadow-sm hover:shadow-md"
                        }`}
                      >
                        Next
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>

            {/* Additional Info Bar */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#2E6F65] rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    Total {totalItems} records
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {showDetails && selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Session Details</h2>
                  <p className="text-blue-100 text-sm">
                    Complete analysis of research session
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Session & User Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Session Info */}
                  <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Session Info
                    </h3>
                    <p>Session ID: {selectedSession.sessionId}</p>
                    <p>Game Mode: {selectedSession.gameMode}</p>
                  </div>

                  {/* User Info */}
                  <div className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      User Profile
                    </h3>
                    <p>Nickname: {selectedSession.user?.nickname}</p>
                    <p>User ID: {selectedSession.user?.userId}</p>
                    <p>Age: {selectedSession.user?.age}</p>
                    <p>Gender: {selectedSession.user?.gender}</p>
                  </div>
                </div>

                {/* Right Column - Performance */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Performance Metrics */}
                  <div className="bg-linear-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Performance Metrics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        Accuracy:{" "}
                        {selectedSession.gameData?.metrics?.accuracyPercentage}%
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        Time: {selectedSession.gameData?.completionTime}s
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        Hints:{" "}
                        {selectedSession.gameData?.metrics?.totalHintsUsed}
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        Level: {selectedSession.gameData?.difficulty}
                      </div>
                    </div>
                  </div>

                  {/* Click Analysis */}
                  <div className="bg-linear-to-br from-yellow-50 to-orange-100 rounded-xl p-5 border border-yellow-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Click Analysis
                    </h3>
                    {selectedSession.gameData?.rawTileClicks?.map(
                      (click: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border border-gray-200 mb-2"
                        >
                          <p>
                            Click #{index + 1}: {click.spriteName} -{" "}
                            {click.wasCorrect ? "Correct" : "Incorrect"} (
                            {click.clickTime}s)
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Stage {selectedSession.gameData?.stage} • Difficulty{" "}
                {selectedSession.gameData?.difficulty}
              </div>

              <div className="flex gap-3">
                {/* Download Button */}
                <button
                  onClick={() => downloadSessionAsExcel(selectedSession)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download XLSX
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            {/* Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Delete className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete Research Session</h3>
                  <p className="text-red-100 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    Are you sure you want to delete this session?
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Session ID:{" "}
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {deleteConfirm.sessionId}
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    All associated data and analytics will be permanently
                    removed.
                  </p>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-amber-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-amber-800 text-sm font-medium">
                      Warning
                    </p>
                    <p className="text-amber-700 text-xs mt-1">
                      This action is irreversible. Please double-check before
                      confirming.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Delete className="w-4 h-4" />
                  Delete Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
