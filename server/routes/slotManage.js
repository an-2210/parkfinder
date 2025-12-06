// server/routes/adminSlots.js
import express from "express";
import Parking from "../models/Parking.js"; // ya Parking.js
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET all slots
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const slots = await Parking.find();
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new slot
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const slot = await Parking.create(req.body);
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update slot
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Parking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE slot
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Parking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
