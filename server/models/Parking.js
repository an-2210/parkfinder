import mongoose from "mongoose";
const parkingSchema = new mongoose.Schema(
  {
    name: String,
    location: String,
    pricePerHour: Number,
    status: String,
    distance: String,
    capacity: Number,
    availableSlots: Number,
    isCovered: Boolean,
    securityLevel: String,
    rating: Number,
    openingTime: String,
    closingTime: String,
    images: { type: [String], default: [] },
    emergencyContact: {
      phone: String,
      supportEmail: String,
      managerName: String,
    },
    isEVChargingStation: {
      type: Boolean,
      default: false,
      index: true, // Adding an index improves query performance when filtering
    },
    chargerType: {
      type: String,
      enum: ["Type 1", "Type 2", "CCS", "CHAdeMO", "None"],
      default: "None",
    },
  },
  { timestamps: true },
);
export default mongoose.model("Parking", parkingSchema);
