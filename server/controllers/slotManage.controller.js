import Parking from "../models/Parking.js";

export const allSlots =  async (req, res) => {
  try {
    const slots = await Parking.find();
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
export const newSlot =  async (req, res) => {
  try {
    const slot = await Parking.create(req.body);
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
export const updateSlot =  async (req, res) => {
  try {
    const updated = await Parking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
export const deleteSlot = async (req, res) => {
  try {
    await Parking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export const getParkingSlots = async (req, res) => {
  try {
    const { isEV, status, location } = req.query;
    
    // Initialize an empty query object
    let query = {};

    // Apply existing filters if they are passed in the request
    if (location) {
      query.location = location;
    }
    
    if (status === 'available') {
      query.isOccupied = false;
    } else if (status === 'occupied') {
      query.isOccupied = true;
    }

    // Apply the new EV filter
    if (isEV === 'true') {
      query.isEVChargingStation = true;
    }

    // Execute the database search with the constructed query
    const slots = await Parking.find(query);

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
    
  } catch (error) {
    console.error('Error fetching parking slots:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch parking slots' 
    });
  }
};
