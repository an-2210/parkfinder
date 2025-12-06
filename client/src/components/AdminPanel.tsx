import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Edit,
  Trash2,
  User,
  ParkingSquare,
  Users,
  Plus,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

interface ParkingSlot {
  _id: string;
  name: string;
  location: string;
  pricePerHour: number;
  status: "available" | "occupied" | "maintenance" | string;
  capacity: number;
  availableSlots: number;
  distance?: string;
  rating?: number;
}

interface User {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
}

type TabType = "parking" | "users";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>("parking");
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [slotForm, setSlotForm] = useState<Partial<ParkingSlot>>({});
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState({ parking: true, users: true });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState({ parking: "", users: "" });
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "parking" | "user";
    id: string;
    name: string;
  } | null>(null);

  const { token } = useAuth();

  const fetchParkingSlots = async () => {
    try {
      setLoading((prev) => ({ ...prev, parking: true }));
      const res = await fetch("http://localhost:5000/api/admin/slots", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setParkingSlots(data.data);
      } else {
        console.error("Fetch Slots Error:", data.message);
        setError(data.message);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading((prev) => ({ ...prev, parking: false }));
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading((prev) => ({ ...prev, users: true }));
      const res = await fetch("http://localhost:5000/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Users Response:", data);

      if (data.success && Array.isArray(data.data)) {
        // ✅ Validate and clean user data
        const validatedUsers = data.data.map((user: User) => ({
          _id: user._id || "",
          name: user.name || "Unknown",
          email: user.email || "No email",
          role: user.role || "user",
          createdAt: user.createdAt || "",
        }));

        setUsers(validatedUsers);
      } else {
        setError(data.message || "Failed to fetch users");
        setUsers([]); // ✅ Empty array set करें
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError("Failed to fetch users");
      setUsers([]); // ✅ Empty array set करें
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    fetchParkingSlots();
  }, [token]);

  // Handle Slot Operations
  const handleDeleteSlot = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/admin/slots/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchParkingSlots();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete parking slot");
    }
  };

  const handleEditSlot = (slot: ParkingSlot) => {
    setEditingSlotId(slot._id);
    setSlotForm(slot);
    setShowSlotForm(true);
  };

  const handleAddOrUpdateSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!slotForm.name?.trim() || !slotForm.location?.trim()) {
      setError("Name and location are required");
      return;
    }
    if (!slotForm.pricePerHour || slotForm.pricePerHour <= 0) {
      setError("Price per hour must be greater than 0");
      return;
    }
    if (!slotForm.capacity || slotForm.capacity <= 0) {
      setError("Capacity must be greater than 0");
      return;
    }
    if (!slotForm.availableSlots || slotForm.availableSlots < 0) {
      setError("Available slots must be 0 or greater");
      return;
    }
    if (slotForm.availableSlots > slotForm.capacity!) {
      setError("Available slots cannot exceed capacity");
      return;
    }

    try {
      const method = editingSlotId ? "PUT" : "POST";
      const url = editingSlotId
        ? `http://localhost:5000/api/admin/slots/${editingSlotId}`
        : "http://localhost:5000/api/admin/slots";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...slotForm,
          pricePerHour: Number(slotForm.pricePerHour),
          capacity: Number(slotForm.capacity),
          availableSlots: Number(slotForm.availableSlots),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSlotForm({});
        setEditingSlotId(null);
        setShowSlotForm(false);
        fetchParkingSlots();
      } else {
        setError(data.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };

  // Handle User Operations
  const handleDeleteUser = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to update user role");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error(error);
      return "Invalid Date";
    }
  };

  // Filter data based on search
  const filteredSlots = parkingSlots.filter(
    (slot) =>
      slot.name.toLowerCase().includes(searchTerm.parking.toLowerCase()) ||
      slot.location.toLowerCase().includes(searchTerm.parking.toLowerCase())
  );

  const filteredUsers = (users || []).filter((user) => {
    const name = user?.name || "";
    const email = user?.email || "";
    const role = user?.role || "";
    const search = searchTerm.users.toLowerCase();

    return (
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      role.toLowerCase().includes(search)
    );
  });
  const getStatusColor = (status?: string): string => {
    switch ((status || "").toLowerCase()) {
      case "available":
        return "bg-green-500 text-white";
      case "occupied":
        return "bg-red-500 text-white";
      case "maintenance":
        return "bg-yellow-500 text-black";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getRoleColor = (role?: string): string => {
    const roleLower = (role || "user").toLowerCase();
    switch (roleLower) {
      case "admin":
        return "bg-purple-500/20 text-purple-300";
      case "user":
        return "bg-blue-500/20 text-blue-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#191919] via-[#0f0f0f] to-[#191919] p-4 md:p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="backdrop-blur-xl bg-[#1B42CB]/10 border border-[#1B42CB]/20 rounded-2xl p-6 md:p-8 shadow-2xl shadow-[#1B42CB]/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-[#EEECF6] to-[#1B42CB] bg-clip-text text-transparent">
                      Admin Panel
                    </h1>
                    <p className="text-[#EEECF6]/60">
                      Manage parking slots and users
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-[#191919]/80 border border-[#EEECF6]/10 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {parkingSlots.length}
                    </div>
                    <div className="text-sm text-[#EEECF6]/60">
                      Parking Slots
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {users.length}
                    </div>
                    <div className="text-sm text-[#EEECF6]/60">Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-8 backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl p-2 shadow-xl">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("parking")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "parking"
                  ? "bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white"
                  : "text-[#EEECF6]/70 hover:text-[#EEECF6] hover:bg-[#1B42CB]/10"
              }`}
            >
              <ParkingSquare className="w-5 h-5" />
              Parking Slots
              {loading.parking && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "users"
                  ? "bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white"
                  : "text-[#EEECF6]/70 hover:text-[#EEECF6] hover:bg-[#1B42CB]/10"
              }`}
            >
              <Users className="w-5 h-5" />
              Users
              {loading.users && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Parking Slots Tab */}
        {activeTab === "parking" && (
          <div className="space-y-6">
            {/* Search and Add Button */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-[#1B42CB]" />
                </div>
                <input
                  type="text"
                  placeholder="Search parking slots by name or location..."
                  value={searchTerm.parking}
                  onChange={(e) =>
                    setSearchTerm((prev) => ({
                      ...prev,
                      parking: e.target.value,
                    }))
                  }
                  className="w-full pl-12 pr-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] placeholder-[#EEECF6]/40 focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
                />
              </div>
              <button
                onClick={() => {
                  setSlotForm({});
                  setEditingSlotId(null);
                  setShowSlotForm(true);
                }}
                className="px-6 py-3 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Slot
              </button>
            </div>

            {/* Slot Form Modal */}
            {showSlotForm && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="backdrop-blur-xl bg-[#191919]/90 border border-[#1B42CB]/30 rounded-2xl w-full max-w-2xl shadow-2xl shadow-[#1B42CB]/10">
                  <div className="p-6 border-b border-[#1B42CB]/20">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-[#EEECF6]">
                        {editingSlotId
                          ? "Edit Parking Slot"
                          : "Add New Parking Slot"}
                      </h2>
                      <button
                        onClick={() => {
                          setShowSlotForm(false);
                          setSlotForm({});
                          setEditingSlotId(null);
                        }}
                        className="w-8 h-8 rounded-lg bg-[#191919] border border-[#1B42CB]/30 flex items-center justify-center text-[#EEECF6] hover:bg-[#FF2F6C]/10 hover:border-[#FF2F6C]/30 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAddOrUpdateSlot} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-[#EEECF6] mb-2">
                          Slot Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={slotForm.name || ""}
                          onChange={(e) =>
                            setSlotForm({ ...slotForm, name: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
                          placeholder="Enter slot name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#EEECF6] mb-2">
                          Location *
                        </label>
                        <input
                          type="text"
                          required
                          value={slotForm.location || ""}
                          onChange={(e) =>
                            setSlotForm({
                              ...slotForm,
                              location: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
                          placeholder="Enter location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#EEECF6] mb-2">
                          Price per Hour (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={slotForm.pricePerHour || ""}
                          onChange={(e) =>
                            setSlotForm({
                              ...slotForm,
                              pricePerHour: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
                          placeholder="Enter price"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#EEECF6] mb-2">
                          Status
                        </label>
                        <select
                          value={slotForm.status || "available"}
                          onChange={(e) =>
                            setSlotForm({ ...slotForm, status: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#EEECF6] mb-2">
                          Total Capacity *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={slotForm.capacity || ""}
                          onChange={(e) =>
                            setSlotForm({
                              ...slotForm,
                              capacity: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
                          placeholder="Enter total capacity"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#EEECF6] mb-2">
                          Available Slots *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={slotForm.availableSlots || ""}
                          onChange={(e) =>
                            setSlotForm({
                              ...slotForm,
                              availableSlots: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
                          placeholder="Enter available slots"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSlotForm(false);
                          setSlotForm({});
                          setEditingSlotId(null);
                        }}
                        className="px-6 py-3 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] font-semibold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        {editingSlotId ? "Update Slot" : "Add Slot"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Parking Slots Grid */}
            {loading.parking ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-[#1B42CB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#EEECF6]/60">Loading parking slots...</p>
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl p-12 text-center">
                <ParkingSquare className="w-16 h-16 text-[#1B42CB]/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#EEECF6] mb-2">
                  No Parking Slots Found
                </h3>
                <p className="text-[#EEECF6]/60 mb-6">
                  {searchTerm.parking
                    ? "Try adjusting your search"
                    : "Add your first parking slot to get started"}
                </p>
                <button
                  onClick={() => {
                    setSlotForm({});
                    setShowSlotForm(true);
                  }}
                  className="px-6 py-3 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300"
                >
                  Add First Slot
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className="backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/10 transition-all duration-300"
                  >
                    {/* Status Badge */}
                    <div
                      className={`px-4 py-2 ${getStatusColor(
                        slot.status
                      )} flex justify-between items-center`}
                    >
                      <div className="text-sm font-medium">
                        {slot.availableSlots}/{slot.capacity} slots
                      </div>
                    </div>

                    {/* Slot Content */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#EEECF6] mb-1">
                            {slot.name}
                          </h3>
                          <p className="text-[#EEECF6]/60 text-sm">
                            {slot.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#EEECF6]">
                            ₹{slot.pricePerHour}
                          </div>
                          <div className="text-sm text-[#EEECF6]/60">
                            per hour
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#EEECF6]/60">
                            Capacity Usage
                          </span>
                          <span className="text-[#EEECF6]">
                            {Math.round(
                              (slot.availableSlots / slot.capacity) * 100
                            )}
                            % available
                          </span>
                        </div>
                        <div className="h-2 bg-[#191919] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-[#1B42CB] to-[#FF2F6C]"
                            style={{
                              width: `${
                                (slot.availableSlots / slot.capacity) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSlot(slot)}
                          className="flex-1 py-2 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] rounded-lg hover:bg-[#1B42CB]/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setShowDeleteConfirm({
                              type: "parking",
                              id: slot._id,
                              name: slot.name,
                            })
                          }
                          className="flex-1 py-2 bg-[#191919] border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-[#1B42CB]" />
              </div>
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm.users}
                onChange={(e) =>
                  setSearchTerm((prev) => ({ ...prev, users: e.target.value }))
                }
                className="w-full pl-12 pr-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] placeholder-[#EEECF6]/40 focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
              />
            </div>

            {/* Users Table */}
            {loading.users ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-[#1B42CB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#EEECF6]/60">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl p-12 text-center">
                <Users className="w-16 h-16 text-[#1B42CB]/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#EEECF6] mb-2">
                  No Users Found
                </h3>
                <p className="text-[#EEECF6]/60">
                  {searchTerm.users
                    ? "Try adjusting your search"
                    : "No users registered yet"}
                </p>
              </div>
            ) : (
              <div className="backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1B42CB]/20">
                        <th className="text-left py-4 px-6 text-[#EEECF6] font-semibold">
                          User
                        </th>
                        <th className="text-left py-4 px-6 text-[#EEECF6] font-semibold">
                          Email
                        </th>
                        <th className="text-left py-4 px-6 text-[#EEECF6] font-semibold">
                          Role
                        </th>
                        <th className="text-left py-4 px-6 text-[#EEECF6] font-semibold">
                          Joined
                        </th>
                        <th className="text-left py-4 px-6 text-[#EEECF6] font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        // ✅ Safe destructuring with defaults
                        const {
                          _id = "",
                          name = "Unknown",
                          email = "No email",
                          role = "user",
                          createdAt = "",
                        } = user || {};

                        return (
                          <tr
                            key={_id}
                            className="border-b border-[#1B42CB]/10 hover:bg-[#1B42CB]/5 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-[#EEECF6]">
                                    {name}
                                  </div>
                                  <div className="text-sm text-[#EEECF6]/60">
                                    ID: {_id.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-[#EEECF6]">
                              {email}
                            </td>
                            <td className="py-4 px-6">
                              <select
                                value={role}
                                onChange={(e) =>
                                  handleRoleChange(_id, e.target.value)
                                }
                                className={`px-3 py-1 rounded-lg text-sm font-medium ${getRoleColor(
                                  role
                                )} border-0 focus:ring-2 focus:ring-[#1B42CB]/20 focus:outline-none`}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="py-4 px-6 text-[#EEECF6]/60">
                              {formatDate(createdAt)}
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() =>
                                  setShowDeleteConfirm({
                                    type: "user",
                                    id: _id,
                                    name: name,
                                  })
                                }
                                className="px-4 py-2 bg-[#191919] border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-[#191919]/90 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl shadow-red-500/10">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#EEECF6]">
                    Confirm Delete
                  </h2>
                  <p className="text-[#EEECF6]/60">
                    Are you sure you want to delete this{" "}
                    {showDeleteConfirm.type}?
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-[#191919]/50 rounded-xl border border-red-500/20">
                <div className="font-medium text-[#EEECF6]">
                  {showDeleteConfirm.name}
                </div>
                <div className="text-sm text-[#EEECF6]/60 mt-1">
                  This action cannot be undone. All associated data will be
                  permanently removed.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] font-semibold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm.type === "parking") {
                      handleDeleteSlot(showDeleteConfirm.id);
                    } else {
                      handleDeleteUser(showDeleteConfirm.id);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                >
                  Delete{" "}
                  {showDeleteConfirm.type === "parking" ? "Slot" : "User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
