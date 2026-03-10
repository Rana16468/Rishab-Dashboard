"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "@/redux/store";
import {
  addNotification,
  setConnectionStatus,
} from "@/redux/Slices/notificationSlice";
import type { Notification } from "@/redux/Slices/notificationSlice";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications,
  );
  const unreadCount = useSelector(
    (state: RootState) => state.notifications.unreadCount,
  );
  const isConnected = useSelector(
    (state: RootState) => state.notifications.isConnected,
  );

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        dispatch(setConnectionStatus(false));
      }
      return;
    }

    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        "https://rishabhbhard-backend.onrender.com",
      {
        auth: {
          token,
        },
        query: {
          userId: token, // Use token as userId for now
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      },
    );

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      dispatch(setConnectionStatus(true));
    });

    socketInstance.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
      dispatch(setConnectionStatus(false));
    });

    socketInstance.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
      dispatch(setConnectionStatus(false));
    });

    // Listen for notifications
    socketInstance.on("notification", (notification: Notification) => {
      dispatch(addNotification(notification));

      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
        });
      }
    });

    // Listen for admin notifications (user::admin event from your test client)
    socketInstance.on("user::admin", (data: any) => {
      console.log("Received admin notification:", data);
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          dispatch(
            addNotification({
              id: `admin-${Date.now()}`,
              title: item.title,
              message: item.message,
              type: "info" as const,
              userId: item.sender,
              data: item,
              timestamp: new Date().toISOString(),
              read: false,
            }),
          );
        });
      } else {
        dispatch(
          addNotification({
            id: `admin-${Date.now()}`,
            title: data.title,
            message: data.message,
            type: "info" as const,
            userId: data.sender,
            data: data,
            timestamp: new Date().toISOString(),
            read: false,
          }),
        );
      }
    });

    // Listen for real-time updates
    socketInstance.on("conversation_update", (data: any) => {
      dispatch(
        addNotification({
          id: `conv-${Date.now()}`,
          title: "Conversation Updated",
          message: data.message || "A conversation has been updated",
          type: "info" as const,
          data,
          timestamp: new Date().toISOString(),
          read: false,
        }),
      );
    });

    socketInstance.on("new_user", (data: any) => {
      dispatch(
        addNotification({
          id: `user-${Date.now()}`,
          title: "New User",
          message: `${data.name || data.nickname} has joined the platform`,
          type: "success" as const,
          data,
          timestamp: new Date().toISOString(),
          read: false,
        }),
      );
    });

    socketInstance.on("system_alert", (data: any) => {
      dispatch(
        addNotification({
          id: `alert-${Date.now()}`,
          title: "System Alert",
          message: data.message,
          type: (data.type || "warning") as
            | "info"
            | "success"
            | "warning"
            | "error",
          data,
          timestamp: new Date().toISOString(),
          read: false,
        }),
      );
    });

    setSocket(socketInstance);

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const markAsRead = (id: string) => {
    dispatch({ type: "notifications/markAsRead", payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: "notifications/markAllAsRead" });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: "notifications/removeNotification", payload: id });
  };

  const clearAllNotifications = () => {
    dispatch({ type: "notifications/clearAllNotifications" });
  };

  const addNotificationFunc = (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    dispatch({ type: "notifications/addNotification", payload: notification });
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addNotification: addNotificationFunc,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
