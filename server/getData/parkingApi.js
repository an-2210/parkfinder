import express from "express";
import Parking from "../models/Parking.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await Parking.find();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Get nearby parking slots
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 5000, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius); // in meters

    // Get all parking slots first (simple approach)
    const allParkings = await Parking.find({});

    // Calculate distance for each slot
    const parkingsWithDistance = allParkings.map((parking) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        parking.coordinates.lat,
        parking.coordinates.lng
      );

      return {
        ...parking.toObject(),
        distance: distance,
        distanceInKm: (distance / 1000).toFixed(1),
      };
    });

    // Filter by radius and sort by distance
    const nearbyParkings = parkingsWithDistance
      .filter((p) => p.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: nearbyParkings,
      count: nearbyParkings.length,
      radius: searchRadius,
      userLocation: { lat: userLat, lng: userLng },
    });
  } catch (error) {
    console.error("Error fetching nearby parkings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper function to calculate distance (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export default router;
