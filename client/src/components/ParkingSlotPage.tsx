import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, List, Map } from "lucide-react";

interface ParkingSlot {
  _id: string;
  name: string;
  location: string;
  pricePerHour: number;
  status: "available" | "occupied" | "maintenance" | string;
  availableSlots: number;
  capacity: number;
  distance: string;
  rating: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ParkingSlot[];
}

// Mock coordinates for demo (आप real coordinates use कर सकते हैं)
const mockCoordinates = [
  { lat: 28.6139, lng: 77.209 }, // Delhi
  { lat: 28.5355, lng: 77.391 }, // Noida
  { lat: 28.4595, lng: 77.0266 }, // Gurgaon
  { lat: 28.7041, lng: 77.1025 }, // North Delhi
  { lat: 28.4089, lng: 77.3178 }, // Faridabad
  { lat: 28.6692, lng: 77.4535 }, // Ghaziabad
];

const ParkingSlotPage: React.FC = () => {
  const navigate = useNavigate();
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list"); // ✅ New state
  const [selectedMapSlot, setSelectedMapSlot] = useState<ParkingSlot | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const fetchParkingSlots = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/parking");
        const result: ApiResponse = await response.json();
        if (result.success) {
          // Add mock coordinates to slots
          const slotsWithCoordinates = result.data.map((slot, index) => ({
            ...slot,
            coordinates: mockCoordinates[index % mockCoordinates.length] || {
              lat: 28.6139,
              lng: 77.209,
            },
          }));
          setParkingSlots(slotsWithCoordinates);
        } else {
          setError(result.message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Default to Delhi if location not available
          setUserLocation({ lat: 28.6139, lng: 77.209 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.209 });
    }

    fetchParkingSlots();
  }, []);

  // ✅ Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): string => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1
      ? `${(distance * 1000).toFixed(0)} m`
      : `${distance.toFixed(1)} km`;
  };

  // ✅ Get directions URL
  const getDirectionsUrl = (slot: ParkingSlot) => {
    if (!slot.coordinates) return "#";
    return `https://www.google.com/maps/dir/?api=1&destination=${slot.coordinates.lat},${slot.coordinates.lng}`;
  };

  // ✅ Handle booking
  const handleBookNow = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setPaymentAmount(Number(slot?.pricePerHour || 0));
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    try {
      const slotId = selectedSlot._id;
      const res = await fetch(`http://localhost:5000/api/book/${slotId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setParkingSlots((prev) =>
          prev.map((s) =>
            s._id === slotId
              ? {
                  ...s,
                  status: "occupied",
                  availableSlots: s.availableSlots - 1,
                }
              : s
          )
        );

        alert("Booking confirmed!");
        setShowModal(false);
        setSelectedSlot(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-500/20 text-green-300 border-l-4 border-green-500";
      case "occupied":
        return "bg-red-500/20 text-red-300 border-l-4 border-red-500";
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-300 border-l-4 border-yellow-500";
      default:
        return "bg-gray-500/20 text-gray-300 border-l-4 border-gray-500";
    }
  };

  const getStatusBadge = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "available":
        return "Available";
      case "occupied":
        return "Occupied";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return "text-green-400";
    if (rating >= 4.0) return "text-yellow-400";
    if (rating >= 3.0) return "text-orange-400";
    return "text-red-400";
  };

  const getAvailabilityPercentage = (
    availableSlots: number,
    capacity: number
  ): number => {
    return Math.round((availableSlots / capacity) * 100);
  };

  const getAvailabilityText = (percentage: number): string => {
    if (percentage >= 70) return "High";
    if (percentage >= 40) return "Moderate";
    if (percentage > 0) return "Limited";
    return "Full";
  };

  const getAvailabilityColor = (percentage: number): string => {
    if (percentage >= 70) return "text-green-400";
    if (percentage >= 40) return "text-yellow-400";
    if (percentage > 0) return "text-orange-400";
    return "text-red-400";
  };

  const filteredAndSortedSlots = React.useMemo(() => {
    let filtered = [...parkingSlots];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (slot) =>
          slot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slot.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (slot) => slot.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case "price":
          filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
          break;
        case "distance":
          if (userLocation) {
            filtered.sort((a, b) => {
              if (!a.coordinates || !b.coordinates) return 0;
              const distA = Math.sqrt(
                Math.pow(a.coordinates.lat - userLocation.lat, 2) +
                  Math.pow(a.coordinates.lng - userLocation.lng, 2)
              );
              const distB = Math.sqrt(
                Math.pow(b.coordinates.lat - userLocation.lat, 2) +
                  Math.pow(b.coordinates.lng - userLocation.lng, 2)
              );
              return distA - distB;
            });
          }
          break;
        case "rating":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    return filtered;
  }, [parkingSlots, searchTerm, statusFilter, sortBy, userLocation]);

  // ✅ Render Map View
  const renderMapView = () => {
    if (!userLocation) {
      return (
        <div className="backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl p-12 text-center">
          <div className="w-24 h-24 bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#1B42CB]/30">
            <Map className="w-12 h-12 text-[#1B42CB]" />
          </div>
          <h3 className="text-2xl font-bold text-[#EEECF6] mb-3">
            Loading Map...
          </h3>
          <p className="text-[#EEECF6]/60 mb-6">
            Fetching your location to show nearby parking slots
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Map Container */}
        <div className="backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="h-[500px] relative">
            {/* Mock Map Background */}
            <div
              className="absolute inset-0 bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, #1B42CB 2px, transparent 2px),
                  radial-gradient(circle at 50% 50%, #FF2F6C 3px, transparent 3px),
                  radial-gradient(circle at 80% 70%, #1B42CB 2px, transparent 2px)
                `,
                backgroundSize: "100px 100px",
              }}
            >
              {/* User Location Marker */}
              <div
                className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "50%",
                  top: "50%",
                }}
              >
                <div className="w-full h-full rounded-full bg-linear-to-br from-blue-500 to-cyan-400 border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30"></div>
              </div>

              {/* Parking Slot Markers */}
              {filteredAndSortedSlots.map((slot, index) => {
                if (!slot.coordinates) return null;

                // Calculate relative position on map
                const latDiff = slot.coordinates.lat - userLocation.lat;
                const lngDiff = slot.coordinates.lng - userLocation.lng;
                const left = 50 + lngDiff * 100;
                const top = 50 - latDiff * 100;

                return (
                  <div
                    key={slot._id}
                    className={`absolute w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 ${
                      selectedMapSlot?._id === slot._id ? "z-10 scale-125" : ""
                    }`}
                    style={{
                      left: `${Math.max(10, Math.min(90, left))}%`,
                      top: `${Math.max(10, Math.min(90, top))}%`,
                    }}
                    onClick={() => setSelectedMapSlot(slot)}
                  >
                    <div
                      className={`
                      w-full h-full rounded-full flex items-center justify-center
                      ${
                        slot.status === "available"
                          ? "bg-linear-to-br from-green-500 to-emerald-400"
                          : slot.status === "occupied"
                          ? "bg-linear-to-br from-red-500 to-pink-400"
                          : "bg-linear-to-br from-yellow-500 to-orange-400"
                      }
                      border-2 border-white shadow-lg
                    `}
                    >
                      <span className="text-white text-xs font-bold">
                        P{index + 1}
                      </span>
                    </div>
                    {selectedMapSlot?._id === slot._id && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                        <div className="bg-[#191919] border border-[#1B42CB]/30 rounded-xl p-3 shadow-xl min-w-[200px]">
                          <div className="font-bold text-[#EEECF6] text-sm mb-1">
                            {slot.name}
                          </div>
                          <div className="text-xs text-[#EEECF6]/60 mb-2">
                            {slot.location}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#EEECF6] font-bold">
                              ₹{slot.pricePerHour}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                slot.status === "available"
                                  ? "bg-green-500/20 text-green-300"
                                  : slot.status === "occupied"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                              }`}
                            >
                              {getStatusBadge(slot.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 backdrop-blur-xl bg-[#191919]/80 border border-[#1B42CB]/30 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-linear-to-br from-green-500 to-emerald-400"></div>
                    <span className="text-xs text-[#EEECF6]">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-linear-to-br from-red-500 to-pink-400"></div>
                    <span className="text-xs text-[#EEECF6]">Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-linear-to-br from-yellow-500 to-orange-400"></div>
                    <span className="text-xs text-[#EEECF6]">Maintenance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-linear-to-br from-blue-500 to-cyan-400"></div>
                    <span className="text-xs text-[#EEECF6]">
                      Your Location
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Slot Details */}
        {selectedMapSlot && (
          <div className="backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#EEECF6]">
                  {selectedMapSlot.name}
                </h3>
                <p className="text-[#EEECF6]/60">{selectedMapSlot.location}</p>
              </div>
              <button
                onClick={() => setSelectedMapSlot(null)}
                className="w-8 h-8 rounded-lg bg-[#191919] border border-[#1B42CB]/30 flex items-center justify-center text-[#EEECF6] hover:bg-[#FF2F6C]/10 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-[#191919]/50 rounded-xl">
                <div className="text-sm text-[#EEECF6]/60 mb-1">Price</div>
                <div className="text-2xl font-bold text-[#EEECF6]">
                  ₹{selectedMapSlot.pricePerHour}
                  <span className="text-sm text-[#EEECF6]/60">/hour</span>
                </div>
              </div>
              <div className="p-4 bg-[#191919]/50 rounded-xl">
                <div className="text-sm text-[#EEECF6]/60 mb-1">
                  Availability
                </div>
                <div className="text-2xl font-bold text-[#EEECF6]">
                  {selectedMapSlot.availableSlots}
                  <span className="text-sm text-[#EEECF6]/60">
                    /{selectedMapSlot.capacity} slots
                  </span>
                </div>
              </div>
              <div className="p-4 bg-[#191919]/50 rounded-xl">
                <div className="text-sm text-[#EEECF6]/60 mb-1">Distance</div>
                <div className="text-2xl font-bold text-[#EEECF6]">
                  {userLocation && selectedMapSlot.coordinates
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        selectedMapSlot.coordinates.lat,
                        selectedMapSlot.coordinates.lng
                      )
                    : selectedMapSlot.distance}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={getDirectionsUrl(selectedMapSlot)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] font-semibold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
              <button
                onClick={() => handleBookNow(selectedMapSlot)}
                disabled={
                  selectedMapSlot.status !== "available" ||
                  selectedMapSlot.availableSlots === 0
                }
                className="flex-1 px-6 py-3 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ✅ Render List View (your existing code)
  const renderListView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedSlots.map((slot) => {
          const availabilityPercentage = getAvailabilityPercentage(
            slot.availableSlots,
            slot.capacity
          );
          const availabilityText = getAvailabilityText(availabilityPercentage);
          const availabilityColor = getAvailabilityColor(
            availabilityPercentage
          );

          return (
            <div
              key={slot._id}
              className="group backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/10 hover:border-[#1B42CB]/40 transition-all duration-500 transform hover:-translate-y-1"
            >
              {/* Status Header */}
              <div className={`px-6 py-4 ${getStatusColor(slot.status)}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-current"></div>
                    <span className="font-bold text-sm">
                      {getStatusBadge(slot.status)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${availabilityColor} bg-black/20`}
                  >
                    {availabilityText}
                  </span>
                </div>
              </div>

              {/* Slot Content */}
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#EEECF6] mb-1">
                      {slot.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-lg font-bold ${getRatingColor(
                          slot.rating
                        )}`}
                      >
                        {slot?.rating ? slot.rating.toFixed(1) : "0.0"}
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < Math.floor(slot.rating)
                                ? "text-[#FF2F6C]"
                                : "text-[#EEECF6]/30"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent">
                      ₹{Number(slot.pricePerHour || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-[#EEECF6]/60">per hour</div>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6 p-4 bg-[#1B42CB]/10 rounded-xl border border-[#1B42CB]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#1B42CB] to-[#1B42CB]/80 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[#EEECF6] font-medium truncate">
                      {slot.location}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-[#191919]/50 border border-[#1B42CB]/10 rounded-xl p-3 text-center">
                    <div className="text-sm text-[#EEECF6]/60 mb-1">
                      Distance
                    </div>
                    <div className="text-lg font-bold text-[#EEECF6]">
                      {userLocation && slot.coordinates
                        ? calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            slot.coordinates.lat,
                            slot.coordinates.lng
                          )
                        : slot.distance}
                    </div>
                  </div>
                  <div className="bg-[#191919]/50 border border-[#1B42CB]/10 rounded-xl p-3 text-center">
                    <div className="text-sm text-[#EEECF6]/60 mb-1">
                      Available
                    </div>
                    <div className="text-lg font-bold text-[#EEECF6]">
                      {slot.availableSlots}
                      <span className="text-sm text-[#EEECF6]/60 ml-1">
                        /{slot.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#191919]/50 border border-[#1B42CB]/10 rounded-xl p-3 text-center">
                    <div className="text-sm text-[#EEECF6]/60 mb-1">Fill %</div>
                    <div className={`text-lg font-bold ${availabilityColor}`}>
                      {availabilityPercentage}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#EEECF6]/60">Capacity Usage</span>
                    <span className="font-semibold text-[#EEECF6]">
                      {availabilityPercentage}% available
                    </span>
                  </div>
                  <div className="h-2 bg-[#191919] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#1B42CB] via-[#FF2F6C] to-[#1B42CB]"
                      style={{ width: `${availabilityPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <a
                    href={getDirectionsUrl(slot)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] rounded-lg hover:bg-[#1B42CB]/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Directions
                  </a>
                  <button
                    onClick={() => handleBookNow(slot)}
                    disabled={
                      slot.status?.toLowerCase() !== "available" ||
                      slot.availableSlots === 0
                    }
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      slot.status?.toLowerCase() === "available" &&
                      slot.availableSlots > 0
                        ? "bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white hover:shadow-lg hover:shadow-[#FF2F6C]/20"
                        : "bg-[#191919] text-[#EEECF6]/40 border border-[#1B42CB]/20 cursor-not-allowed"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {slot.status?.toLowerCase() === "available" &&
                    slot.availableSlots > 0
                      ? "Book Now"
                      : slot.availableSlots === 0
                      ? "Fully Booked"
                      : getStatusBadge(slot.status)}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#191919] via-[#0f0f0f] to-[#191919] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#191919]"></div>
            </div>
          </div>
          <p className="mt-6 text-[#EEECF6] text-lg font-semibold">
            Loading parking slots...
          </p>
          <p className="text-[#EEECF6]/60 mt-2">Fetching latest availability</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#191919] via-[#0f0f0f] to-[#191919] flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-[#1B42CB]/10 border border-[#1B42CB]/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-[#1B42CB]/10">
          <div className="text-center">
            <div className="w-20 h-20 bg-linear-to-br from-[#FF2F6C]/20 to-[#1B42CB]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FF2F6C]/30">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-[#EEECF6] mb-3">
              Connection Error
            </h2>
            <p className="text-[#EEECF6]/70 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-linear-to-r from-[#1B42CB] to-[#1B42CB]/80 text-white font-semibold rounded-xl hover:from-[#1B42CB]/90 hover:to-[#1B42CB]/70 transition-all duration-300 hover:shadow-lg hover:shadow-[#1B42CB]/20"
              >
                Retry
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] font-semibold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#191919] via-[#0f0f0f] to-[#191919] p-4 md:p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1B42CB]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="backdrop-blur-xl bg-[#1B42CB]/10 border border-[#1B42CB]/20 rounded-2xl p-6 md:p-8 shadow-2xl shadow-[#1B42CB]/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                  <span className="text-xl">🚗</span>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-[#EEECF6] to-[#1B42CB] bg-clip-text text-transparent">
                    SmartPark
                  </h1>
                  <p className="text-[#EEECF6]/60">
                    Intelligent Parking Solutions
                  </p>
                </div>
              </div>
              <p className="text-[#EEECF6]/80 max-w-2xl">
                Find, book, and manage parking slots with real-time availability
                and smart recommendations.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-[#191919]/80 border border-[#EEECF6]/10 rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {parkingSlots.reduce(
                      (sum, slot) => sum + slot.availableSlots,
                      0
                    )}
                  </div>
                  <div className="text-sm text-[#EEECF6]/60">
                    Available Slots
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {parkingSlots.length}
                  </div>
                  <div className="text-sm text-[#EEECF6]/60">Locations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    ₹{Math.min(...parkingSlots.map((s) => s.pricePerHour))}
                  </div>
                  <div className="text-sm text-[#EEECF6]/60">
                    Starting Price
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {parkingSlots.reduce((sum, slot) => sum + slot.capacity, 0)}
                  </div>
                  <div className="text-sm text-[#EEECF6]/60">
                    Total Capacity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filter/Search Section with View Toggle */}
        <div className="mb-8 backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-[#1B42CB]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search location or parking name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] placeholder-[#EEECF6]/40 focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
              />
            </div>

            {/* View Toggle Buttons */}
            <div className="flex items-center gap-3">
              <div className="flex bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-3 flex items-center gap-2 transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white"
                      : "text-[#EEECF6]/70 hover:text-[#EEECF6] hover:bg-[#1B42CB]/10"
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-4 py-3 flex items-center gap-2 transition-all duration-300 ${
                    viewMode === "map"
                      ? "bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white"
                      : "text-[#EEECF6]/70 hover:text-[#EEECF6] hover:bg-[#1B42CB]/10"
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Map
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-4 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-4 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
              >
                <option value="">Sort by</option>
                <option value="price">Price: Low to High</option>
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Content */}
        {filteredAndSortedSlots.length === 0 ? (
          <div className="backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#1B42CB]/30">
              <span className="text-3xl">🚗</span>
            </div>
            <h3 className="text-2xl font-bold text-[#EEECF6] mb-3">
              No Parking Slots Found
            </h3>
            <p className="text-[#EEECF6]/60 mb-6">
              {searchTerm || statusFilter
                ? "Try adjusting your filters"
                : "Check back later for available spots"}
            </p>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setSortBy("");
                }}
                className="px-6 py-3 bg-linear-to-r from-[#1B42CB] to-[#1B42CB]/80 text-white font-semibold rounded-xl hover:from-[#1B42CB]/90 hover:to-[#1B42CB]/70 transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === "map" ? (
          renderMapView()
        ) : (
          renderListView()
        )}

        {/* Summary Section */}
        {parkingSlots.length > 0 && (
          <div className="mt-8 backdrop-blur-xl bg-linear-to-r from-[#1B42CB]/10 to-[#FF2F6C]/10 border border-[#1B42CB]/20 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {
                    filteredAndSortedSlots.filter(
                      (s) => s.status === "available"
                    ).length
                  }
                </div>
                <div className="text-[#EEECF6]/60">Available Now</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {Math.round(
                    (filteredAndSortedSlots.reduce(
                      (sum, s) => sum + s.availableSlots / s.capacity,
                      0
                    ) /
                      filteredAndSortedSlots.length) *
                      100
                  )}
                  %
                </div>
                <div className="text-[#EEECF6]/60">Average Availability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  ₹
                  {Math.round(
                    filteredAndSortedSlots.reduce(
                      (sum, s) => sum + s.pricePerHour,
                      0
                    ) / filteredAndSortedSlots.length
                  )}
                </div>
                <div className="text-[#EEECF6]/60">Avg. Price/Hour</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {filteredAndSortedSlots.length}
                </div>
                <div className="text-[#EEECF6]/60">Showing Slots</div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Booking Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-[#191919]/90 border border-[#1B42CB]/30 rounded-2xl w-full max-w-md shadow-2xl shadow-[#1B42CB]/10 animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1B42CB]/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-linear-to-r from-[#EEECF6] to-[#1B42CB] bg-clip-text text-transparent">
                  Confirm Booking
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg bg-[#191919] border border-[#1B42CB]/30 flex items-center justify-center text-[#EEECF6] hover:bg-[#FF2F6C]/10 hover:border-[#FF2F6C]/30 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Slot Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1B42CB]/10 rounded-xl">
                  <div>
                    <div className="text-sm text-[#EEECF6]/60">
                      Parking Slot
                    </div>
                    <div className="font-bold text-[#EEECF6]">
                      {selectedSlot.name}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                    <span className="text-xl">🚗</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#191919]/50 rounded-lg">
                    <div className="text-sm text-[#EEECF6]/60">Location</div>
                    <div className="font-medium text-[#EEECF6] truncate">
                      {selectedSlot.location}
                    </div>
                  </div>
                  <div className="p-3 bg-[#191919]/50 rounded-lg">
                    <div className="text-sm text-[#EEECF6]/60">Distance</div>
                    <div className="font-medium text-[#EEECF6]">
                      {selectedSlot.distance}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-linear-to-r from-[#1B42CB]/10 to-[#FF2F6C]/10 rounded-xl border border-[#1B42CB]/20">
                  <div>
                    <div className="text-sm text-[#EEECF6]/60">
                      Price per Hour
                    </div>
                    <div className="text-2xl font-bold bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent">
                      ₹
                      {selectedSlot?.pricePerHour !== undefined
                        ? Number(selectedSlot.pricePerHour).toFixed(2)
                        : "0.00"}
                    </div>
                  </div>
                  <div className="text-[#EEECF6]/60">/hour</div>
                </div>

                <div className="p-4 bg-[#191919]/50 rounded-xl border border-[#1B42CB]/10">
                  <label className="block text-sm font-medium text-[#EEECF6] mb-3">
                    Payment Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    min={
                      selectedSlot?.pricePerHour !== undefined
                        ? Number(selectedSlot.pricePerHour).toFixed(2)
                        : "0.00"
                    }
                    className="w-full px-4 py-3 bg-[#191919] border border-[#1B42CB]/30 rounded-lg text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
                  />
                  <div className="text-xs text-[#EEECF6]/40 mt-2">
                    Minimum amount: ₹
                    {selectedSlot?.pricePerHour !== undefined
                      ? Number(selectedSlot.pricePerHour).toFixed(2)
                      : "0.00"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] font-semibold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleConfirmBooking();
                  }}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Confirm & Pay
                  <span>→</span>
                </button>
              </div>

              {/* Security Note */}
              <div className="text-center pt-4 border-t border-[#1B42CB]/10">
                <div className="flex items-center justify-center gap-2 text-sm text-[#EEECF6]/40">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure payment • Instant confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSlotPage;
