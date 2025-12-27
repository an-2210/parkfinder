import mongoose from "mongoose";
import Parking from "./models/Parking.js";
import dotenv from "dotenv";
dotenv.config();

// seed.js
const rawData = [
  {
    name: "Connaught Place Parking",
    location: "Connaught Place, New Delhi",
    pricePerHour: 50,
    status: "available",
    capacity: 200,
    availableSlots: 45,
    coordinates: { lat: 28.6315, lng: 77.2187 },
    addressDetails: {
      street: "Inner Circle",
      area: "Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110001",
    },
    isCovered: true,
    securityLevel: "high",
    rating: 4.5,
    openingTime: "06:00 AM",
    closingTime: "11:00 PM",
    features: ["cctv", "valet", "car-wash"],
  },
  {
    name: "Chandni Chowk Multi-Level Parking",
    location: "Chandni Chowk, Delhi",
    pricePerHour: 30,
    status: "available",
    capacity: 150,
    availableSlots: 20,
    coordinates: { lat: 28.6562, lng: 77.2315 },
    addressDetails: {
      street: "Main Road",
      area: "Chandni Chowk",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110006",
    },
    isCovered: true,
    securityLevel: "medium",
    rating: 4.0,
    openingTime: "07:00 AM",
    closingTime: "10:00 PM",
    features: ["cctv", "washroom"],
  },
  {
    name: "Cyber City Parking",
    location: "Cyber City, Gurgaon",
    pricePerHour: 80,
    status: "available",
    capacity: 300,
    availableSlots: 120,
    coordinates: { lat: 28.4962, lng: 77.0853 },
    addressDetails: {
      street: "DLF Cyber City",
      area: "Sector 25",
      city: "Gurgaon",
      state: "Haryana",
      country: "India",
      zipCode: "122002",
    },
    isCovered: true,
    securityLevel: "premium",
    rating: 4.7,
    openingTime: "24 Hours",
    closingTime: "24 Hours",
    features: ["cctv", "ev-charging", "valet", "car-wash", "cafeteria"],
  },
  {
    name: "Ambience Mall Parking",
    location: "Ambience Mall, Gurgaon",
    pricePerHour: 60,
    status: "occupied",
    capacity: 500,
    availableSlots: 0,
    coordinates: { lat: 28.4595, lng: 77.0266 },
    addressDetails: {
      street: "NH 48",
      area: "DLF Phase 3",
      city: "Gurgaon",
      state: "Haryana",
      country: "India",
      zipCode: "122002",
    },
    isCovered: true,
    securityLevel: "high",
    rating: 4.6,
    openingTime: "10:00 AM",
    closingTime: "11:00 PM",
    features: ["cctv", "valet", "ev-charging", "washroom", "cafeteria"],
  },
  {
    name: "Lajpat Nagar Metro Parking",
    location: "Lajpat Nagar, Delhi",
    pricePerHour: 25,
    status: "available",
    capacity: 80,
    availableSlots: 15,
    coordinates: { lat: 28.5675, lng: 77.2431 },
    addressDetails: {
      street: "Near Metro Station",
      area: "Lajpat Nagar",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110024",
    },
    isCovered: false,
    securityLevel: "medium",
    rating: 3.8,
    openingTime: "06:00 AM",
    closingTime: "10:00 PM",
  },
];

// Mongo URI
const MONGO_URI = process.env.MONGO_URI;
const parkingData = rawData.map((slot) => ({
  ...slot,
  _id: new mongoose.Types.ObjectId(),
}));
async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing data (optional)
    await Parking.deleteMany();

    // Insert new data
    await Parking.insertMany(parkingData);

    console.log("Parking data inserted successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDB();
