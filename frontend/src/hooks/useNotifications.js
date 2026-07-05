import { useState, useEffect } from "react";
import io from "socket.io-client";

export const useNotifications = (user) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // 1. Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();

    // 2. Setup Socket.IO for real-time notifications
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    
    // Join personal user room
    socket.emit("joinUserRoom", user.uid);

    // Listen for new notifications
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/read`, {
        method: "PUT",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/user/${user.uid}/read-all`, {
        method: "PUT",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};
