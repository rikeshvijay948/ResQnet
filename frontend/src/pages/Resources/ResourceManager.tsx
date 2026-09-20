import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import type { Report, Resource, ResourceCategory } from "../../types";
import {
  apiAddResource,
  apiAllocateResource,
  apiGetReports,
  apiGetResources,
} from "../../services/api";
import {
  FaBoxes,
  FaPlus,
  FaSyncAlt,
  FaMapMarkerAlt,
  FaTimes,
  FaHandsHelping,
  FaFirstAid,
  FaUtensils,
  FaLifeRing,
  FaTruck,
  FaCampground,
  FaCheckCircle,
} from "react-icons/fa";

export const ResourceManager: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeReports, setActiveReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Allocation Modal State
  const [allocatingResource, setAllocatingResource] = useState<Resource | null>(null);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [allocationAmount, setAllocationAmount] = useState("");
  const [allocationNotes, setAllocationNotes] = useState("");
  const [allocating, setAllocating] = useState(false);

  // Add Resource Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ResourceCategory>("Medical");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("units");
  const [newLocation, setNewLocation] = useState("");
  const [adding, setAdding] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [resData, repData] = await Promise.all([
        apiGetResources(),
        apiGetReports(),
      ]);

      if (resData.success && resData.resources) {
        setResources(resData.resources);
      }
      if (repData.success && repData.reports) {
        setActiveReports(
          repData.reports.filter((r) => r.status !== "Resolved")
        );
      }
    } catch (err) {
      console.error("Error loading resources data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingResource) return;

    const amount = Number(allocationAmount);
    if (!amount || amount <= 0) {
      alert("Please specify a valid quantity to allocate.");
      return;
    }

    if (amount > allocatingResource.availableQuantity) {
      alert(
        `Cannot allocate more than available quantity (${allocatingResource.availableQuantity} ${allocatingResource.unit}).`
      );
      return;
    }

    setAllocating(true);

    try {
      const matchedReport = activeReports.find((r) => r._id === selectedReportId);
      const res = await apiAllocateResource(allocatingResource._id, {
        reportId: selectedReportId || undefined,
        incidentName: matchedReport
          ? `${matchedReport.disasterType} at ${matchedReport.location}`
          : "General Taskforce Deployment",
        amount,
        notes: allocationNotes.trim(),
      });

      if (res.success && res.resource) {
        setResources((prev) =>
          prev.map((r) => (r._id === allocatingResource._id ? res.resource! : r))
        );
        setAllocatingResource(null);
        setAllocationAmount("");
        setSelectedReportId("");
        setAllocationNotes("");
        alert(res.message || "Supplies allocated successfully!");
      } else {
        alert("Allocation failed: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Allocation error:", err);
      alert("Error allocating supplies.");
    } finally {
      setAllocating(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newQuantity) {
      alert("Please fill in resource name and quantity.");
      return;
    }

    setAdding(true);

    try {
      const res = await apiAddResource({
        name: newName.trim(),
        category: newCategory,
        totalQuantity: Number(newQuantity),
        unit: newUnit.trim() || "units",
        location: newLocation.trim() || "Central Emergency Reserve",
      });

      if (res.success && res.resource) {
        setResources((prev) => [...prev, res.resource!]);
        setAddModalOpen(false);
        setNewName("");
        setNewQuantity("");
        setNewUnit("units");
        setNewLocation("");
      } else {
        alert("Failed to add resource: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Add resource error:", err);
      alert("Could not add resource.");
    } finally {
      setAdding(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Medical":
        return <FaFirstAid className="text-red-600" />;
      case "Food & Water":
        return <FaUtensils className="text-blue-600" />;
      case "Rescue Equipment":
        return <FaLifeRing className="text-amber-600" />;
      case "Vehicles":
        return <FaTruck className="text-purple-600" />;
      case "Shelter":
        return <FaCampground className="text-emerald-600" />;
      default:
        return <FaBoxes className="text-gray-600" />;
    }
  };

  const filteredResources = resources.filter((res) => {
    const matchesCategory =
      categoryFilter === "All" || res.category === categoryFilter;
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalSuppliesCount = resources.reduce((acc, r) => acc + r.totalQuantity, 0);
  const totalAllocatedCount = resources.reduce((acc, r) => acc + r.allocatedQuantity, 0);
  const lowStockCount = resources.filter((r) => r.status === "Low Stock" || r.status === "Depleted").length;

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200/60">
              <FaBoxes />
              <span>Emergency Supply Chain & Resource Logistics</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Relief Resources & Inventory
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Track emergency supplies, medical kits, rations, and allocate assets directly to active crisis response operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <FaPlus className="text-xs" />
              <span>Add Stock / Supply</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3.5 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <FaSyncAlt className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Sync Stock"}</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06]">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Tracked Stock
            </span>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalSuppliesCount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Across all relief categories</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06]">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Allocated to Active Missions
            </span>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {totalAllocatedCount.toLocaleString()}
            </p>
            <p className="text-xs text-blue-500/80 mt-1">
              {totalSuppliesCount > 0
                ? Math.round((totalAllocatedCount / totalSuppliesCount) * 100)
                : 0}
              % inventory deployed
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06]">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Low Stock Alerts
            </span>
            <p className="text-3xl font-bold text-amber-600 mt-1">
              {lowStockCount}
            </p>
            <p className="text-xs text-amber-500/80 mt-1">Supplies requiring replenishment</p>
          </div>
        </div>

        {/* CONTROLS & CATEGORY PILLS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-black/[0.06] mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Search supply or warehouse depot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-black/[0.08] rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["All", "Medical", "Food & Water", "Rescue Equipment", "Vehicles", "Shelter"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                      categoryFilter === cat
                        ? "bg-gray-900 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* INVENTORY CARDS GRID */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-base font-bold text-gray-900">Loading Relief Inventory...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center shadow-xl border border-black/[0.06]">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4 text-2xl">
              <FaBoxes />
            </div>
            <h3 className="text-base font-bold text-gray-900">No matching supplies found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your category filter or add a new stock item.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => {
              const availablePct =
                res.totalQuantity > 0
                  ? Math.round((res.availableQuantity / res.totalQuantity) * 100)
                  : 0;

              return (
                <div
                  key={res._id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.08] hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-black/[0.06] flex items-center justify-center text-lg shadow-2xs">
                          {getCategoryIcon(res.category)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 leading-tight">
                            {res.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            {res.category}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          res.status === "In Stock"
                            ? "bg-emerald-100 text-emerald-800"
                            : res.status === "Low Stock"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    {/* Depot Location */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                      <FaMapMarkerAlt className="text-[10px] text-gray-400" />
                      <span className="truncate">{res.location}</span>
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="space-y-1.5 my-4">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-700">
                          {res.availableQuantity.toLocaleString()} {res.unit} available
                        </span>
                        <span className="text-gray-400">
                          Total: {res.totalQuantity.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            availablePct > 40
                              ? "bg-emerald-500"
                              : availablePct > 15
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${availablePct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>{res.allocatedQuantity.toLocaleString()} {res.unit} dispatched</span>
                        <span>{availablePct}% reserve</span>
                      </div>
                    </div>
                  </div>

                  {/* Allocate Supplies Button */}
                  <div className="pt-4 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      disabled={res.availableQuantity <= 0}
                      onClick={() => {
                        setAllocatingResource(res);
                        setAllocationAmount("");
                        setSelectedReportId(activeReports[0]?._id || "");
                        setAllocationNotes("");
                      }}
                      className="w-full py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaHandsHelping className="text-xs" />
                      <span>Allocate to Active Incident</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ALLOCATION MODAL */}
      {allocatingResource && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-black/[0.08] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaHandsHelping className="text-blue-600" />
                  <span>Dispatch Relief Supplies</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Item: <span className="font-bold text-gray-900">{allocatingResource.name}</span> (Max: {allocatingResource.availableQuantity} {allocatingResource.unit})
                </p>
              </div>
              <button
                onClick={() => setAllocatingResource(null)}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAllocate} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Active Emergency Incident *
                </label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {activeReports.map((rep) => (
                    <option key={rep._id} value={rep._id}>
                      {rep.disasterType} at {rep.location} (~{rep.peopleAffected} people)
                    </option>
                  ))}
                  <option value="">General Sector Taskforce Deployment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Quantity to Dispatch ({allocatingResource.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={allocatingResource.availableQuantity}
                  placeholder={`Enter amount in ${allocatingResource.unit}`}
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Dispatch Notes / Logistics Route
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched via Logistics Van 4 to Marine sector"
                  value={allocationNotes}
                  onChange={(e) => setAllocationNotes(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAllocatingResource(null)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={allocating}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {allocating ? "Dispatching Supplies..." : "Confirm Supply Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD RESOURCE MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-black/[0.08] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaBoxes className="text-blue-600" />
                <span>Add Relief Supplies to Inventory</span>
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Supply Item Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Portable Water Purification Units"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ResourceCategory)}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Medical">Medical</option>
                    <option value="Food & Water">Food & Water</option>
                    <option value="Rescue Equipment">Rescue Equipment</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Shelter">Shelter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Measurement Unit *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kits, liters, packs, units"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Depot / Warehouse Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dadar Central Depot"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  <span>{adding ? "Adding..." : "Add to Stock"}</span>
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

export default ResourceManager;
