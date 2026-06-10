// server/routes/adminSlots.js
import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { allSlots, deleteSlot, getParkingSlots, newSlot, updateSlot } from "../controllers/slotManage.controller.js";

const router = express.Router();

// GET /api/slots -> Used by the frontend for users to search/filter slots
router.get("/", getParkingSlots);

// GET all slots
router.get("/admin/all", authMiddleware, adminMiddleware, allSlots);

// POST new slot
router.post("/", authMiddleware, adminMiddleware,newSlot);

// PUT update slot
router.put("/:id", authMiddleware, adminMiddleware,updateSlot);

// DELETE slot
router.delete("/:id", authMiddleware, adminMiddleware,deleteSlot);

export default router;
