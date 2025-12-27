// routes/geocode.js
import express from 'express';
import axios from 'axios';
import Location from '../models/Location.js';

const router = express.Router();

// Forward geocoding - location name to coordinates
router.get('/forward', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Check cache first
    const cached = await Location.findOne({ query: query.toLowerCase() });
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }
    
    // Use OpenStreetMap Nominatim API
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          addressdetails: 1,
          'accept-language': 'en'
        },
        headers: {
          'User-Agent': 'ParkingApp/1.0'
        }
      }
    );
    
    if (response.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    // Save to cache
    const locationData = response.data[0];
    const location = new Location({
      query: query.toLowerCase(),
      coordinates: {
        lat: parseFloat(locationData.lat),
        lng: parseFloat(locationData.lon)
      },
      formattedAddress: locationData.display_name,
      addressComponents: {
        street: locationData.address?.road || '',
        area: locationData.address?.suburb || locationData.address?.neighbourhood || '',
        city: locationData.address?.city || locationData.address?.town || locationData.address?.village || '',
        state: locationData.address?.state || '',
        country: locationData.address?.country || '',
        zipCode: locationData.address?.postcode || ''
      },
      placeId: locationData.place_id
    });
    
    await location.save();
    
    res.json({
      success: true,
      data: location,
      cached: false
    });
    
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Geocoding service error'
    });
  }
});

// Reverse geocoding - coordinates to address
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat: lat,
          lon: lng,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'ParkingApp/1.0'
        }
      }
    );
    
    res.json({
      success: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Reverse geocoding service error'
    });
  }
});

export default router;