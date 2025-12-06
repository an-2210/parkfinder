import express from "express";
import User from "../models/User.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get all users (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  const users = await User.find().select("-password"); // remove password
  res.json({ success: true, data: users });
});

// Update a user (admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, role } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role },
    { new: true }
  ).select("-password");
  res.json({ success: true, data: updatedUser });
});

// Delete a user (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "User deleted" });
});

export default router;
