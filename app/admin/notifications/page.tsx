"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { buttonbg, textPrimary } from "@/contexts/theme";
import { notificationApi, NotificationData } from "@/redux/Api/notificationApi";

interface NotificationResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  all_notification: NotificationData[];
}

export default function NotificationsPage() {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const pageSize = 10;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);

        const response: NotificationResponse =
          await notificationApi.getAllNotifications(currentPage, pageSize);

        // ✅ FIX: correct path is response.all_notification
        const allNotifications = response?.all_notification;

        if (!allNotifications || !Array.isArray(allNotifications)) {
          console.error("Unexpected response shape:", response);
          toast.error("Invalid API response");
          return;
        }

        setNotifications(allNotifications);
        // ✅ FIX: correct path is response.meta
        setTotalPages(response.meta.totalPage);
        setTotal(response.meta.total);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [currentPage]);

  const formatTimeAgo = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  // ✅ Pagination page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="p-5 min-h-screen">
      {/* Header */}
      <div
        className={`${buttonbg} px-4 py-3 rounded-md mb-3 flex items-center gap-3`}
      >
        <button
          onClick={() => router.back()}
          className="text-white hover:opacity-90"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-white text-xl font-bold">Notifications</h1>

        <span className="ml-auto text-white text-sm">{total} total</span>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className={`w-10 h-10 animate-spin ${textPrimary}`} />
        </div>
      ) : (
        <>
          {/* Notification List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No notifications
              </div>
            ) : (
              notifications.map((item) => (
                <Card
                  key={item._id}
                  className={`flex gap-4 p-4 border rounded-lg ${
                    item.isDelete ? "opacity-70 bg-gray-50" : ""
                  }`}
                >
                  <div
                    className={`w-1 rounded-full ${
                      item.isDelete ? "bg-transparent" : "bg-[#2E6F65]"
                    }`}
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-[#2E6F65]">
                        {item.title}
                      </h4>

                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    {item.message && (
                      <p className="text-gray-600 text-sm mt-1">
                        {item.message}
                      </p>
                    )}

                    {!item.isDelete && (
                      <p className="text-xs text-[#2E6F65] font-bold mt-1">
                        New
                      </p>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  {/* Previous */}
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((p) => p - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {/* Page numbers with ellipsis */}
                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <span className="px-3 py-2 text-sm text-gray-400">
                          ...
                        </span>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  {/* Next */}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage((p) => p + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Page info */}
          {total > 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Page {currentPage} of {totalPages} · {total} total
            </p>
          )}
        </>
      )}
    </div>
  );
}
