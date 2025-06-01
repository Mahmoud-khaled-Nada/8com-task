import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { notificationAPI } from "@/lib/api";
import { Notification } from "@/utils/types";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: number;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { pathname } = useLocation(); // detects route changes
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // if (pathname !== "/notifications") return;

    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) return;

    const currentUser = JSON.parse(storedUser);
    if (!currentUser?.role) return;

    const methodName = currentUser.role === "admin" ? "getAllNotificationsAsAdmin" : "getAllNotifications";

    setIsLoading(true); // reset loading
    notificationAPI[methodName]()
      .then(({ data }) => {
        setNotifications(data);
      })
      .catch((err) => {
        console.error("Failed to fetch notifications:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAsRead = (id: string) => {
    notificationAPI
      .markAsRead(id)
      .then(({ data }) =>
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === id ? { ...notification, isRead: true } : notification
          )
        )
      )
      .catch((err) => {
        console.error("Failed to mark notification as read:", err);
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
        });
      });
  };

  const markAllAsRead = () => {
    notificationAPI
      .markAllAsRead()
      .then(({ data }) => {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      })
      .catch((err) => {
        console.error("Failed to mark all notifications as read:", err);
        toast({
          title: "Error",
          description: "Failed to mark all notifications as read",
        });
      });
  };

  const removeNotification = (id: string) => {
    //

    notificationAPI
      .delete(id)
      .then(({ data }) => setNotifications((prev) => prev.filter((notification) => notification._id !== id)))
      .catch((err) => {
        console.error("Failed to mark notification as read:", err);
        toast({
          title: "Error",
          description: "Failed to mark notification as delete",
        });
      });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  console.log("unreadCount", unreadCount);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        unreadCount,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
