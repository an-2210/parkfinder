// models/Location.js
import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  query: { type: String, required: true, index: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  formattedAddress: String,
  addressComponents: {
    street: String,
    area: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  placeId: String,
  timestamp: { type: Date, default: Date.now }
});

// Cache TTL - 30 days
locationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model("Location", locationSchema);