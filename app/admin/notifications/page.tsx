"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { buttonbg, textPrimary } from "@/contexts/theme";

interface NotificationItem {
  _id: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

// Mock Data Generator
const generateMockNotifications = (count: number): NotificationItem[] => {
  return Array.from({ length: count }).map((_, i) => ({
    _id: `notif-${i}`,
    title: `Notification Title ${i + 1}`,
    message: `This is a sample notification message for item ${i + 1}.`,
    isRead: i > 2, // First 3 are unread
    createdAt: new Date(Date.now() - i * 3600000).toISOString(), // spaced by hours
  }));
};

const MOCK_DATA = generateMockNotifications(25);

export default function NotificationsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  
  const pageSize = 10;
  const totalPages = Math.ceil(MOCK_DATA.length / pageSize);

  // Simulate Fetching Data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setNotifications(MOCK_DATA.slice(start, end));
      setIsLoading(false);
    }, 800);
  }, [currentPage]);

  const formatTimeAgo = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setIsMarkingRead(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      toast.error("Failed to update notification status");
    } finally {
        setIsMarkingRead(false);
    }
  };
  
  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length === 0) {
      toast.info("All notifications are already marked as read");
      return;
    }
    
    try {
      setIsMarkingRead(true);
       // Simulate API call
       await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      
      toast.success("All notifications marked as read");
      
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    } finally {
        setIsMarkingRead(false);
    }
  };

  return (
    <div className="p-5 min-h-screen">
      {/* Header Section */}
      <div className={`${buttonbg} px-4 md:px-5 py-3 rounded-md mb-3 flex flex-wrap md:flex-nowrap items-start md:items-center gap-2 md:gap-3`}>
        <button
          onClick={() => router.back()}
          className="text-white hover:opacity-90 transition"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white text-xl sm:text-2xl font-bold">Notifications</h1>
        <div className="ml-0 md:ml-auto w-full md:w-auto flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0">
          <span className="text-white text-sm">
            {notifications.filter(n => !n.isRead).length} unread
          </span>
          <Button 
            onClick={handleMarkAllRead}
            size="sm"
            variant="secondary"
            className="text-[#2E6F65] bg-white hover:bg-white/90 cursor-pointer"
            disabled={isLoading || isMarkingRead}
          >
            Mark all read
          </Button>
        </div>
      </div>

      {/* Page Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className={`w-10 h-10 animate-spin ${textPrimary}`} />
        </div>
      ) : (
        <>
            <div className="space-y-3">
                {notifications.map((item) => (
                    <Card
                      key={item._id}
                      onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                      className={`group flex items-start justify-between gap-4 p-4 border border-gray-200 bg-white rounded-lg transition hover:shadow-sm cursor-pointer ${
                        item.isRead ? "opacity-90 grayscale-[0.5] bg-gray-50" : ""
                      }`}
                    >
                      {/* Unread Accent Bar */}
                      <div className={`w-1 rounded-full self-stretch ${item.isRead ? "bg-transparent" : "bg-[#2E6F65]"}`} />

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base md:text-lg font-semibold text-[#2E6F65]">{item.title}</h4>
                          <span className="text-xs md:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </div>
                        {item.message && (
                          <p className="text-gray-600 text-sm mt-1 pr-2">{item.message}</p>
                        )}
                        {!item.isRead && (
                          <p className="text-[12px] text-[#2E6F65] mt-1 font-bold">New</p>
                        )}
                      </div>

                      {/* Actions (show on hover or if unread) */}
                      <div 
                        className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!item.isRead && (
                          <Button 
                            size="sm" 
                            className="bg-[#2E6F65] hover:bg-[#2E6F65]/90"
                            onClick={() => handleMarkAsRead(item._id)}
                            disabled={isMarkingRead}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </Card>
                ))}
              {notifications.length === 0 && (
                <div className="text-center text-gray-500 py-10">No notifications</div>
              )}
            </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); if(currentPage > 1) setCurrentPage(c => c - 1); }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    
                    {Array.from({length: totalPages}).map((_, i) => (
                        <PaginationItem key={i}>
                            <PaginationLink 
                                href="#" 
                                isActive={currentPage === i + 1}
                                onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) setCurrentPage(c => c + 1); }} 
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
          </div>
          
        </>
      )}
    </div>
  );
}
