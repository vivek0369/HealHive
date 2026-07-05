import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get all notifications for a specific user
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50); // Get last 50 notifications
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark a notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read for a user
router.put("/user/:userId/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// Create a notification (Usually called internally, but exposing via API for testing/flexibility)
router.post("/", async (req, res) => {
  try {
    const { userId, message, type, link } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }
    const newNotification = new Notification({ userId, message, type, link });
    await newNotification.save();
    
    // In a real scenario, you'd use io.to(userId).emit("newNotification", newNotification) here
    // but io is managed in server.js. We'll attach io to req.app in server.js
    const io = req.app.get("socketio");
    if (io) {
      io.to(userId).emit("newNotification", newNotification);
    }

    res.status(201).json(newNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

export default router;
