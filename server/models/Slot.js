import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  name: String,
  location: String,
  pricePerHour: Number,
  status: String,
  capacity: Number,
  availableSlots: Number,
});

export default mongoose.models.Parking || mongoose.model("Parking", slotSchema);
