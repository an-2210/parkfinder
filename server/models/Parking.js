// models/Parking.js
import mongoose from "mongoose";

const parkingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  pricePerHour: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance"],
    default: "available",
  },

  // Location-based fields add karo
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },

  // Detailed address
  addressDetails: {
    street: String,
    area: String,
    city: String,
    state: String,
    country: { type: String, default: "India" },
    zipCode: String,
  },

  // Existing fields (update if needed)
  distance: String, // Keep for backward compatibility
  capacity: { type: Number, required: true, min: 1 },
  availableSlots: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function (v) {
        return v <= this.capacity;
      },
      message: "Available slots cannot exceed capacity",
    },
  },
  isCovered: { type: Boolean, default: false },
  securityLevel: {
    type: String,
    enum: ["low", "medium", "high", "premium"],
    default: "medium",
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  openingTime: {
    type: String,
    default: "06:00 AM",
  },
  closingTime: {
    type: String,
    default: "11:00 PM",
  },

  // Additional useful fields
  features: [
    {
      type: String,
      enum: [
        "cctv",
        "valet",
        "ev-charging",
        "washroom",
        "cafeteria",
        "car-wash",
        "wheelchair-access",
      ],
    },
  ],

  description: String,

  contactNumber: String,

  // For analytics
  totalBookings: { type: Number, default: 0 },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for geospatial queries
parkingSchema.index({ "coordinates.lat": 1, "coordinates.lng": 1 });

// Pre-save middleware for validation
parkingSchema.pre("save", function (next) {
  if (this.availableSlots > this.capacity) {
    this.availableSlots = this.capacity;
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual for distance calculation (if needed)
parkingSchema.virtual("isOpen").get(function () {
  const now = new Date();
  const currentTime = now.getHours() + ":" + now.getMinutes();
  // Simple time comparison logic
  return true; // Add proper logic based on openingTime/closingTime
});

export default mongoose.model("Parking", parkingSchema);
