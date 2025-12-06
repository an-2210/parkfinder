import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// Get all booked slots
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("parkingId");
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
