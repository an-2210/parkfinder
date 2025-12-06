import express from "express";
import parkingApi from "./getData/parkingApi.js";
import connectDB from "./database/db.js";
import bookingRouter from "./routes/booking.js";
import getbookingdata from "./getData/booking.js";
import authRoutes from "./routes/authRoutes.js";
import adminSlotsRouter from "./routes/slotManage.js";
import userManage from "./routes/userManage.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Authorization"],
  })
);

// Middleware to parse JSON body (if needed later)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Use Booking Routes
app.use("/api", bookingRouter);

// get/Use Booking APi data
app.use("/api", getbookingdata);
// get/Use Parking API routes
app.use("/api", parkingApi);

// use auth route.
app.use("/api/auth", authRoutes);

// Use slot management route.
app.use("/api/admin/slots", adminSlotsRouter);

// use user management route.
app.use("/api/admin/users", userManage);

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Parking Slot API");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
