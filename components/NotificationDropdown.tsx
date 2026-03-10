"use client";

import { BellRing } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef } from "react";
import { notificationApi, NotificationData } from "@/redux/Api/notificationApi";
import { toast } from "sonner";

export default function NotificationDropdown() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const previousNotificationIds = useRef<Set<string>>(new Set());
  // FIX: skip toasts on the very first fetch
  const isFirstFetch = useRef(true);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationApi.getAllNotifications(1, 50);
        const unreadNotifications = response.all_notification.filter(
          (n: NotificationData) => !n.isDelete,
        );

        const currentIds = new Set<string>(
          unreadNotifications.map((n: NotificationData) => n._id),
        );

        if (!isFirstFetch.current) {
          // FIX: only toast for notifications that didn't exist before
          const newNotifications = unreadNotifications.filter(
            (n: NotificationData) =>
              !previousNotificationIds.current.has(n._id),
          );

          newNotifications.forEach((notification: NotificationData) => {
            toast.success(`New Notification: ${notification.title}`, {
              description: notification.message,
              duration: 5000,
              action: {
                label: "View",
                onClick: () => router.push("/admin/notifications"),
              },
            });
          });
        }

        isFirstFetch.current = false;
        previousNotificationIds.current = currentIds;
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <button
      onClick={() => router.push("/admin/notifications")}
      className="relative p-2 bg-transparent border-none hover:bg-transparent"
    >
      <BellRing className="w-7 h-7 text-red-500" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </button>
  );
}
