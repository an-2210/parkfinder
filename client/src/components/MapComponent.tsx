import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom parking icon
const createParkingIcon = (status: string) => {
  const statusLower = (status || "unknown").toLowerCase();
  return new L.Icon({
    iconUrl:
      statusLower === "available"
        ? "https://cdn-icons-png.flaticon.com/512/3178/3178283.png" // Green parking icon
        : "https://cdn-icons-png.flaticon.com/512/3178/3178295.png", // Red parking icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: "parking-marker",
  });
};

// User location icon
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface ParkingSlot {
  _id?: string;
  name: string;
  location: string;
  pricePerHour: number;
  status: string;
  distance: string;
  capacity: number;
  availableSlots: number;
  isCovered: boolean;
  securityLevel: string;
  rating: number;
  openingTime: string;
  closingTime: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface MapComponentProps {
  parkingSlots: ParkingSlot[];
  loading?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  parkingSlots,
  loading = false,
}) => {
  // Default center (Delhi)
  const defaultCenter: [number, number] = [28.6139, 77.209];

  if (loading) {
    return (
      <div className="flex-1">
        <div className="relative">
          <div className="backdrop-blur-xl bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 border border-[#1B42CB]/30 rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-[#EEECF6]">Live Map</div>
                <div className="text-xs px-3 py-1 bg-[#191919]/50 rounded-full text-[#EEECF6]">
                  Loading...
                </div>
              </div>
              <div className="h-48 bg-[#191919]/50 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter out slots with invalid coordinates
  const validParkingSlots = parkingSlots.filter(
    (slot) => 
      slot.coordinates && 
      typeof slot.coordinates.lat === 'number' && 
      typeof slot.coordinates.lng === 'number' &&
      !isNaN(slot.coordinates.lat) && 
      !isNaN(slot.coordinates.lng)
  );

  return (
    <div className="flex-1">
      <div className="relative">
        <div className="backdrop-blur-xl bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 border border-[#1B42CB]/30 rounded-2xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-[#EEECF6]">Live Map</div>
              <div className="text-xs px-3 py-1 bg-[#191919]/50 rounded-full text-[#EEECF6]">
                {validParkingSlots.length} Spots
              </div>
            </div>

            <div className="h-48 bg-[#191919]/50 rounded-xl overflow-hidden">
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location marker */}
                <Marker position={defaultCenter} icon={userIcon}>
                  <Popup>
                    <div className="font-semibold">Your Location</div>
                  </Popup>
                </Marker>

                {/* Parking slots markers */}
                {validParkingSlots.map((slot) => {
                  const status = slot.status || "unknown";
                  const statusFormatted = status.charAt(0).toUpperCase() + status.slice(1);
                  
                  return (
                    <Marker
                      key={slot._id || slot.name}
                      position={[slot.coordinates.lat, slot.coordinates.lng]}
                      icon={createParkingIcon(status)}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-bold text-lg text-gray-800">
                            {slot.name || "Unknown Parking"}
                          </h3>
                          <p className="text-gray-600 text-sm">{slot.location || "Location not specified"}</p>

                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Status:</span>
                              <span
                                className={`font-semibold ${
                                  status.toLowerCase() === "available"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {statusFormatted}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Price:</span>
                              <span className="font-semibold">
                                ₹{slot.pricePerHour || 0}/hr
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Available:</span>
                              <span className="font-semibold">
                                {(slot.availableSlots || 0)}/{(slot.capacity || 0)}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Distance:</span>
                              <span className="font-semibold">
                                {slot.distance || "N/A"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Rating:</span>
                              <span className="font-semibold">
                                {(slot.rating || 0).toFixed(1)} ★
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Security:</span>
                              <span className="font-semibold">
                                {slot.securityLevel || "N/A"}
                              </span>
                            </div>
                          </div>

                          {slot.isCovered && (
                            <div className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              Covered Parking
                            </div>
                          )}

                          <div className="mt-3 text-xs text-gray-500">
                            Timings: {slot.openingTime || "N/A"} - {slot.closingTime || "N/A"}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            <div className="flex items-center justify-between text-sm text-[#EEECF6]/60">
              <span>Interactive map showing available parking spots</span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-xs">Full</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;