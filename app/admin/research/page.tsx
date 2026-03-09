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

  // Function to download all current page data as Excel
  const downloadAllCurrentPageAsExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ["Research Sessions Report", "", "", "", ""],
      ["Generated:", new Date().toLocaleString(), "", "", ""],
      ["Page:", `${page} of ${totalPages}`, "", "", ""],
      ["Items per page:", limit, "", "", ""],
      ["Total sessions:", totalItems, "", "", ""],
      ["", "", "", "", ""],
      ["Session ID", "Game Mode", "User ID", "Nickname", "Status"],
      ...contents.map((item) => [
        item.originalData?.sessionId || "",
        item.originalData?.gameMode || "",
        item.originalData?.user?.userId || "",
        item.originalData?.user?.nickname || "",
        item.originalData?.gameData?.completionTime
          ? "Completed"
          : "Incomplete",
      ]),
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

    // Style summary sheet
    const summaryRange = XLSX.utils.decode_range(wsSummary["!ref"] || "A1");
    for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
      for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!wsSummary[cellAddress]) continue;

        // Header styling
        if (row === 0 || row === 6) {
          wsSummary[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "FFE6B8" } },
          };
        }
      }
    }

    // Detailed Data Sheet
    const detailedData = [
      [
        "Session ID",
        "Game Mode",
        "User ID",
        "Nickname",
        "Age",
        "Gender",
        "Hobbies",
        "Languages",
        "Difficulty",
        "Stage",
        "Completion Time",
        "Hints Used",
        "Accuracy",
        "Instruction",
        "Total Clicks",
        "Correct Clicks",
        "Incorrect Clicks",
        "Average Click Time",
      ],
      ...contents.map((item) => [
        item.originalData?.sessionId || "",
        item.originalData?.gameMode || "",
        item.originalData?.user?.userId || "",
        item.originalData?.user?.nickname || "",
        item.originalData?.user?.age || "",
        item.originalData?.user?.gender || "",
        item.originalData?.user?.hobbies?.join(", ") || "",
        item.originalData?.user?.language?.join(", ") || "",
        item.originalData?.gameData?.difficulty || "",
        item.originalData?.gameData?.stage || "",
        item.originalData?.gameData?.completionTime || "",
        item.originalData?.gameData?.metrics?.totalHintsUsed || "",
        item.originalData?.gameData?.metrics?.accuracyPercentage || "",
        item.originalData?.gameData?.metrics?.instructionText || "",
        item.originalData?.gameData?.rawTileClicks?.length || 0,
        item.originalData?.gameData?.rawTileClicks?.filter(
          (click: any) => click.wasCorrect,
        ).length || 0,
        item.originalData?.gameData?.rawTileClicks?.filter(
          (click: any) => !click.wasCorrect,
        ).length || 0,
        item.averageClickTime || "",
      ]),
    ];

    const wsDetailed = XLSX.utils.aoa_to_sheet(detailedData);

    // Style detailed sheet
    const detailedRange = XLSX.utils.decode_range(wsDetailed["!ref"] || "A1");
    for (let row = detailedRange.s.r; row <= detailedRange.e.r; row++) {
      for (let col = detailedRange.s.c; col <= detailedRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!wsDetailed[cellAddress]) continue;

        // Header styling
        if (row === 0) {
          wsDetailed[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "D4E6F1" } },
          };
        }
      }
    }

    // Set column widths
    wsSummary["!cols"] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
    ];

    wsDetailed["!cols"] = [
      { wch: 25 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 8 },
      { wch: 8 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 8 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsDetailed, "Detailed Data");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Download file
    const fileName = `Research_Sessions_Page_${page}_${new Date().toISOString().split("T")[0]}.xlsx`;
    saveAs(blob, fileName);
  };
  const downloadSessionAsExcel = (sessionData: any) => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Session Summary Sheet
    const summaryData = [
      ["Session Information", "", ""],
      ["Field", "Value", ""],
      ["Session ID", sessionData.sessionId || "", ""],
      ["Game Mode", sessionData.gameMode || "", ""],
      ["User ID", sessionData.user?.userId || "", ""],
      ["Nickname", sessionData.user?.nickname || "", ""],
      ["Age", sessionData.user?.age || "", ""],
      ["Gender", sessionData.user?.gender || "", ""],
      ["Hobbies", sessionData.user?.hobbies?.join(", ") || "", ""],
      ["Languages", sessionData.user?.language?.join(", ") || "", ""],
      ["Difficulty", sessionData.gameData?.difficulty || "", ""],
      ["Stage", sessionData.gameData?.stage || "", ""],
      ["Completion Time (s)", sessionData.gameData?.completionTime || "", ""],
      ["Hints Used", sessionData.gameData?.metrics?.totalHintsUsed || "", ""],
      [
        "Accuracy (%)",
        sessionData.gameData?.metrics?.accuracyPercentage || "",
        "",
      ],
      ["Instruction", sessionData.gameData?.metrics?.instructionText || "", ""],
      ["", "", ""],
      ["Performance Summary", "", ""],
      ["Total Clicks", sessionData.gameData?.rawTileClicks?.length || 0, ""],
      [
        "Correct Clicks",
        sessionData.gameData?.rawTileClicks?.filter(
          (click: any) => click.wasCorrect,
        ).length || 0,
        "",
      ],
      [
        "Incorrect Clicks",
        sessionData.gameData?.rawTileClicks?.filter(
          (click: any) => !click.wasCorrect,
        ).length || 0,
        "",
      ],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

    // Style the summary sheet
    const summaryRange = XLSX.utils.decode_range(wsSummary["!ref"] || "A1");
    for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
      for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!wsSummary[cellAddress]) continue;

        // Make headers bold
        if (row === 0 || (row >= 17 && row <= 17)) {
          wsSummary[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "FFE6B8" } },
          };
        }

        // Make field names bold
        if (col === 0 && row >= 1 && row <= 16) {
          wsSummary[cellAddress].s = {
            font: { bold: true },
          };
        }
      }
    }

    // Click Details Sheet
    const clickHeaders = [
      "Click No",
      "Sprite Name",
      "Correct/Incorrect",
      "Response Time (s)",
      "Timestamp",
    ];
    const clickData =
      sessionData.gameData?.rawTileClicks?.map((click: any, index: number) => [
        index + 1,
        click.spriteName || "",
        click.wasCorrect ? "Correct" : "Incorrect",
        click.clickTime || 0,
        `${click.clickTime}s`,
      ]) || [];

    const wsClicks = XLSX.utils.aoa_to_sheet([clickHeaders, ...clickData]);

    // Style the clicks sheet
    const clickRange = XLSX.utils.decode_range(wsClicks["!ref"] || "A1");
    for (let row = clickRange.s.r; row <= clickRange.e.r; row++) {
      for (let col = clickRange.s.c; col <= clickRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!wsClicks[cellAddress]) continue;

        // Make header bold
        if (row === 0) {
          wsClicks[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "D4E6F1" } },
          };
        }

        // Color code correct/incorrect
        if (row > 0 && col === 2) {
          const isCorrect =
            sessionData.gameData?.rawTileClicks?.[row - 1]?.wasCorrect;
          wsClicks[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: isCorrect ? "C6E0B4" : "F8CECC" } },
          };
        }
      }
    }

    // Set column widths
    wsSummary["!cols"] = [
      { wch: 20 }, // Field
      { wch: 30 }, // Value
      { wch: 10 }, // Empty
    ];

    wsClicks["!cols"] = [
      { wch: 10 }, // Click No
      { wch: 20 }, // Sprite Name
      { wch: 15 }, // Correct/Incorrect
      { wch: 15 }, // Response Time
      { wch: 15 }, // Timestamp
    ];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, wsSummary, "Session Summary");
    XLSX.utils.book_append_sheet(wb, wsClicks, "Click Details");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Download file
    const fileName = `Session_${sessionData.sessionId}_${new Date().toISOString().split("T")[0]}.xlsx`;
    saveAs(blob, fileName);
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
          category:
            session.gameMode === "OC"
              ? "Object Classification"
              : session.gameMode === "UOT"
                ? "Unordered Task"
                : session.gameMode === "VF"
                  ? "Visual Finding"
                  : "Unknown",
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
                        {item.category}
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
                          <button className="text-gray-500 hover:text-gray-700 transition-colors">
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
                      className="appearance-none bg-[#2E6F65] text-white rounded-md px-3 py-1 pr-8 text-sm font-medium cursor-pointer hover:bg-[#2E6F65]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E6F65]/50"
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
                            : "bg-white text-gray-700 hover:bg-[#2E6F65] hover:text-white border border-gray-200 shadow-sm hover:shadow-md"
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
                                    ? "bg-[#2E6F65] text-white shadow-md"
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
                            : "bg-white text-gray-700 hover:bg-[#2E6F65] hover:text-white border border-gray-200 shadow-sm hover:shadow-md"
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
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Session & User Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Session Card */}
                  <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Session Info
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Session ID
                        </span>
                        <p className="font-mono text-sm bg-white px-2 py-1 rounded border">
                          {selectedSession.sessionId}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Game Mode
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedSession.gameMode === "UOT"
                                ? "bg-purple-100 text-purple-800"
                                : selectedSession.gameMode === "OC"
                                  ? "bg-blue-100 text-blue-800"
                                  : selectedSession.gameMode === "VF"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedSession.gameMode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Card */}
                  <div className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        User Profile
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {selectedSession.user?.nickname
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedSession.user?.nickname}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedSession.user?.userId}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Age:</span>
                          <p className="font-medium">
                            {selectedSession.user?.age}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Gender:</span>
                          <p className="font-medium capitalize">
                            {selectedSession.user?.gender}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Hobbies
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSession.user?.hobbies?.map(
                            (hobby: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-white rounded text-xs border"
                              >
                                {hobby}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Languages
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSession.user?.language?.map(
                            (lang: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-white rounded text-xs border"
                              >
                                {lang}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Game Data & Performance */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Performance Metrics */}
                  <div className="bg-linear-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Performance Metrics
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {
                            selectedSession.gameData?.metrics
                              ?.accuracyPercentage
                          }
                          %
                        </div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedSession.gameData?.completionTime}s
                        </div>
                        <div className="text-xs text-gray-500">Time</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedSession.gameData?.metrics?.totalHintsUsed}
                        </div>
                        <div className="text-xs text-gray-500">Hints</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedSession.gameData?.difficulty}
                        </div>
                        <div className="text-xs text-gray-500">Level</div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Instruction
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {selectedSession.gameData?.metrics?.instructionText}
                      </p>
                    </div>
                  </div>

                  {/* Click Analysis */}
                  <div className="bg-linear-to-br from-yellow-50 to-orange-100 rounded-xl p-5 border border-yellow-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 15l-2 5L9 9l11 4-5 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Click Analysis
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {selectedSession.gameData?.rawTileClicks?.map(
                        (click: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    click.wasCorrect
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {click.spriteName}
                                  </span>
                                  <div className="text-xs text-gray-500">
                                    Click #{index + 1}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    click.wasCorrect
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {click.wasCorrect ? "Correct" : "Incorrect"}
                                </span>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900">
                                    {click.clickTime}s
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Response Time
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Stage {selectedSession.gameData?.stage} • Difficulty{" "}
                  {selectedSession.gameData?.difficulty}
                </div>
                <div className="flex gap-3">
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
        </div>
      )}
    </div>
  );
}
