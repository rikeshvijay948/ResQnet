import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility, FacilityType } from "../../types";
import { apiAddFacility, apiGetFacilities } from "../../services/api";
import {
  FaHospital,
  FaCampground,
  FaFireExtinguisher,
  FaPhoneAlt,
  FaPlus,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaTimes,
  FaCheckCircle,
  FaRoute,
} from "react-icons/fa";

// Custom Leaflet Icons for Facilities
const createFacilityIcon = (type: string) => {
  let bgColor = "#2563eb";
  let label = "🏥";

  if (type === "Shelter") {
    bgColor = "#059669";
    label = "🏕️";
  } else if (type === "Relief Camp") {
    bgColor = "#7c3aed";
    label = "⛺";
  } else if (type === "Fire Station") {
    bgColor = "#dc2626";
    label = "🚒";
  } else if (type === "Police Station") {
    bgColor = "#1e293b";
    label = "👮";
  }

  return L.divIcon({
    className: "custom-facility-marker",
    html: `
      <div style="
        background: ${bgColor};
        width: 34px;
        height: 34px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 2px solid white;
      ">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

export const FacilitiesDirectory: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Add Facility Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<FacilityType>("Shelter");
  const [newAddress, setNewAddress] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newOccupancy, setNewOccupancy] = useState("0");
  const [newPhone, setNewPhone] = useState("");
  const [newAmenities, setNewAmenities] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchFacilities = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiGetFacilities();
      if (res.success && res.facilities) {
        setFacilities(res.facilities);
      }
    } catch (err) {
      console.error("Error loading facilities:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newAddress.trim() || !newLat || !newLng || !newCapacity) {
      alert("Please fill in all required facility fields.");
      return;
    }

    setAdding(true);

    try {
      const amenitiesArr = newAmenities
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await apiAddFacility({
        name: newName.trim(),
        type: newType,
        address: newAddress.trim(),
        latitude: Number(newLat),
        longitude: Number(newLng),
        capacity: Number(newCapacity),
        currentOccupancy: Number(newOccupancy) || 0,
        contactPhone: newPhone.trim(),
        amenities: amenitiesArr,
      });

      if (res.success && res.facility) {
        setFacilities((prev) => [...prev, res.facility!]);
        setAddModalOpen(false);
        setNewName("");
        setNewAddress("");
        setNewLat("");
        setNewLng("");
        setNewCapacity("");
        setNewOccupancy("0");
        setNewPhone("");
        setNewAmenities("");
      } else {
        alert("Failed to add facility: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error creating facility:", err);
      alert("Could not register facility.");
    } finally {
      setAdding(false);
    }
  };

  const filteredFacilities = facilities.filter((f) => {
    const matchesType = typeFilter === "All" || f.type === typeFilter;
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalCapacity = facilities.reduce((acc, f) => acc + f.capacity, 0);
  const totalOccupancy = facilities.reduce((acc, f) => acc + f.currentOccupancy, 0);
  const totalAvailable = Math.max(totalCapacity - totalOccupancy, 0);

  // Map center default
  const centerPosition: [number, number] =
    facilities.length > 0 && facilities[0].latitude && facilities[0].longitude
      ? [facilities[0].latitude, facilities[0].longitude]
      : [19.076, 72.8777];

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200/60">
              <FaHospital />
              <span>Emergency Facilities & Relief Infrastructure</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Shelters, Hospitals & Relief Camps
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Find real-time shelter bed availability, emergency hospital ICUs, relief camps, and fire response stations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <FaPlus className="text-xs" />
              <span>Register New Facility</span>
            </button>

            <button
              onClick={() => fetchFacilities(true)}
              disabled={refreshing}
              className="px-3.5 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <FaSyncAlt className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Updating..." : "Refresh Facilities"}</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06]">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Emergency Capacity
            </span>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalCapacity.toLocaleString()} beds / slots
            </p>
            <p className="text-xs text-gray-400 mt-1">Across {facilities.length} registered centers</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06]">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Available Open Capacity
            </span>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {totalAvailable.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600/80 mt-1">Ready to receive displaced citizens</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06]">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
              Current Occupancy
            </span>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {totalOccupancy.toLocaleString()}
            </p>
            <p className="text-xs text-purple-500/80 mt-1">
              {totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0}% utilization rate
            </p>
          </div>
        </div>

        {/* INTERACTIVE RELIEF FACILITIES MAP */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-xl border border-black/[0.06] mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" />
              <span>Interactive Spatial Facilities Map</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">🏥 Hospital</span>
              <span className="flex items-center gap-1">🏕️ Shelter</span>
              <span className="flex items-center gap-1">⛺ Relief Camp</span>
              <span className="flex items-center gap-1">🚒 Fire Station</span>
            </div>
          </div>

          <div className="h-[420px] rounded-2xl overflow-hidden border border-black/[0.08] shadow-inner relative z-10">
            <MapContainer
              center={centerPosition}
              zoom={11}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {facilities.map((fac) => {
                if (!fac.latitude || !fac.longitude) return null;
                return (
                  <Marker
                    key={fac._id}
                    position={[fac.latitude, fac.longitude]}
                    icon={createFacilityIcon(fac.type)}
                  >
                    <Popup>
                      <div className="p-1 min-w-[200px] text-xs">
                        <span className="font-bold text-gray-900 text-sm block">
                          {fac.name}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600 block mt-0.5">
                          {fac.type} • {fac.status}
                        </span>
                        <p className="text-gray-500 mt-1">{fac.address}</p>

                        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-[11px]">
                          <span className="font-semibold text-gray-700">Capacity: </span>
                          <strong className="text-emerald-700">
                            {fac.availableCapacity} / {fac.capacity} open
                          </strong>
                        </div>

                        {fac.contactPhone && (
                          <div className="mt-2">
                            <a
                              href={`tel:${fac.contactPhone}`}
                              className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <FaPhoneAlt className="text-[9px]" />
                              <span>{fac.contactPhone}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* CONTROLS & FILTER */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-black/[0.06] mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Search facility by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-black/[0.08] rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {["All", "Hospital", "Shelter", "Relief Camp", "Fire Station"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    typeFilter === t
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FACILITIES LIST */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-base font-bold text-gray-900">Loading Facilities Directory...</p>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center shadow-xl border border-black/[0.06]">
            <p className="text-sm font-bold text-gray-900">No matching facilities found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map((fac) => {
              const occupancyPct =
                fac.capacity > 0
                  ? Math.round((fac.currentOccupancy / fac.capacity) * 100)
                  : 0;

              return (
                <div
                  key={fac._id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.08] hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-black/[0.06] flex items-center justify-center text-lg shadow-2xs">
                          {fac.type === "Hospital" && <FaHospital className="text-blue-600" />}
                          {fac.type === "Shelter" && <FaCampground className="text-emerald-600" />}
                          {fac.type === "Relief Camp" && <FaCampground className="text-purple-600" />}
                          {fac.type === "Fire Station" && <FaFireExtinguisher className="text-red-600" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 leading-tight">
                            {fac.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                            {fac.type}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          fac.status === "Operational"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {fac.status}
                      </span>
                    </div>

                    {/* Address */}
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                      <FaMapMarkerAlt className="text-[10px] text-red-500 shrink-0" />
                      <span className="truncate">{fac.address}</span>
                    </p>

                    {/* Capacity Meter */}
                    <div className="space-y-1.5 my-4">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-emerald-700">
                          {fac.availableCapacity.toLocaleString()} beds available
                        </span>
                        <span className="text-gray-400">
                          Cap: {fac.capacity.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyPct > 85
                              ? "bg-red-500"
                              : occupancyPct > 60
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>{fac.currentOccupancy.toLocaleString()} occupied</span>
                        <span>{occupancyPct}% full</span>
                      </div>
                    </div>

                    {/* Amenities Badges */}
                    {fac.amenities && fac.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {fac.amenities.map((am, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-gray-50 text-gray-600 text-[10px] font-medium border border-black/[0.04]"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 mt-4 flex items-center gap-2">
                    {fac.contactPhone && (
                      <a
                        href={`tel:${fac.contactPhone}`}
                        className="flex-1 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <FaPhoneAlt className="text-[10px]" />
                        <span>Call Facility</span>
                      </a>
                    )}

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                      title="Open GPS Directions"
                    >
                      <FaRoute className="text-xs" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* REGISTER FACILITY MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-black/[0.08] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaHospital className="text-blue-600" />
                <span>Register Emergency Facility / Shelter</span>
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddFacility} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Facility Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bandra West Community Relief Hall"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Facility Type *
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as FacilityType)}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Shelter">Shelter</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Relief Camp">Relief Camp</option>
                    <option value="Fire Station">Fire Station</option>
                    <option value="Police Station">Police Station</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 22 2650 0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Physical Address *
                </label>
                <input
                  type="text"
                  placeholder="Street, City, Sector"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 19.0519"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 72.8291"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Total Bed Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 200"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Current Occupancy
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 40"
                    value={newOccupancy}
                    onChange={(e) => setNewOccupancy(e.target.value)}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Amenities & Facilities (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clean Water, ICU, Family Cots, Kitchen, Helipad"
                  value={newAmenities}
                  onChange={(e) => setNewAmenities(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <FaCheckCircle className="text-xs" />
                  <span>{adding ? "Registering..." : "Register Facility"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="py-6 text-center text-xs text-gray-400">
        © 2026 ResQNet. Professional Disaster Coordination Platform.
      </footer>
    </div>
  );
};

export default FacilitiesDirectory;
