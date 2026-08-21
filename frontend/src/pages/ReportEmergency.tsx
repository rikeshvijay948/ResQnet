import { useState } from "react";

function ReportEmergency() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [location, setLocation] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [disasterType, setDisasterType] = useState("");
  const [severity, setSeverity] = useState("");
  const [peopleAffected, setPeopleAffected] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // ==========================================
  // MANUAL LOCATION SEARCH
  // ==========================================

  const searchLocation = async () => {
    if (!location.trim()) {
      alert("⚠️ Please enter a location first.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}&limit=1`
      );

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const data = await response.json();

      if (data.length === 0) {
        setLatitude(null);
        setLongitude(null);
        setLocationMessage("❌ Location not found.");
        return;
      }

      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);

      setLatitude(lat);
      setLongitude(lng);

      // Use the actual location name returned by the geocoder
      setLocation(data[0].display_name);

      setLocationMessage("✅ Location found successfully!");
    } catch (error) {
      console.error("Location search error:", error);
      setLocationMessage("❌ Unable to find this location.");
    } finally {
      setLocationLoading(false);
    }
  };

  // ==========================================
  // CURRENT GPS LOCATION
  // ==========================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("❌ Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        setLocation(
          `Lat: ${lat.toFixed(6)}, Long: ${lng.toFixed(6)}`
        );

        setLocationMessage("✅ Current location detected!");
        setLocationLoading(false);
      },
      (error) => {
        console.error("Location error:", error);

        setLocationLoading(false);

        if (error.code === 1) {
          setLocationMessage(
            "❌ Location permission was denied."
          );
        } else if (error.code === 2) {
          setLocationMessage(
            "❌ Your location could not be determined."
          );
        } else if (error.code === 3) {
          setLocationMessage(
            "❌ Location request timed out."
          );
        } else {
          setLocationMessage(
            "❌ Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================
  // SUBMIT REPORT
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fullName ||
      !phoneNumber ||
      !emergencyContact ||
      !location ||
      !disasterType ||
      !severity ||
      !peopleAffected
    ) {
      alert("⚠️ Please fill in all required fields.");
      return;
    }

    const reportData = {
      fullName,
      phoneNumber,
      emergencyContact,
      location,
      latitude,
      longitude,
      disasterType,
      severity,
      peopleAffected: Number(peopleAffected),
      description,
    };

    console.log("📤 Sending Emergency Report:", reportData);

    try {
      const response = await fetch(
        "http://localhost:5000/report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportData),
        }
      );

      const data = await response.json();

      console.log("📥 Backend Response:", data);

      if (data.success) {
        alert("✅ Emergency Report Submitted Successfully!");

        setFullName("");
        setPhoneNumber("");
        setEmergencyContact("");
        setLocation("");
        setLatitude(null);
        setLongitude(null);
        setLocationMessage("");
        setDisasterType("");
        setSeverity("");
        setPeopleAffected("");
        setDescription("");
        setImage(null);
      } else {
        alert("❌ Failed to submit emergency report.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Could not connect to the ResQNet server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-8">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          🚨 Report Emergency
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          {/* Phone */}
          <input
            type="tel"
            placeholder="Phone Number *"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          {/* Emergency Contact */}
          <input
            type="tel"
            placeholder="Emergency Contact Number *"
            value={emergencyContact}
            onChange={(e) =>
              setEmergencyContact(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />

          {/* LOCATION */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Emergency Location *
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter city or location e.g. Mumbai"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setLatitude(null);
                  setLongitude(null);
                  setLocationMessage("");
                }}
                className="flex-1 border rounded-lg p-3"
              />

              <button
                type="button"
                onClick={searchLocation}
                disabled={locationLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
              >
                {locationLoading ? "..." : "🔎 Search"}
              </button>
            </div>

            {/* Current GPS */}
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              📍 Use My Current Location
            </button>

            {/* Location status */}
            {locationMessage && (
              <p className="mt-3 text-sm font-medium">
                {locationMessage}
              </p>
            )}

            {/* Coordinates */}
            {latitude !== null &&
              longitude !== null && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-700">
                    📍 Coordinates Ready
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    Latitude: {latitude.toFixed(6)}
                  </p>

                  <p className="text-sm text-gray-600">
                    Longitude: {longitude.toFixed(6)}
                  </p>
                </div>
              )}
          </div>

          {/* Disaster Type */}
          <select
            value={disasterType}
            onChange={(e) =>
              setDisasterType(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="">
              Select Disaster Type *
            </option>
            <option value="Flood">Flood</option>
            <option value="Fire">Fire</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Cyclone">Cyclone</option>
            <option value="Landslide">Landslide</option>
          </select>

          {/* Severity */}
          <select
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="">
              Select Severity *
            </option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          {/* People Affected */}
          <input
            type="number"
            min="1"
            placeholder="Number of People Affected *"
            value={peopleAffected}
            onChange={(e) =>
              setPeopleAffected(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />

          {/* Description */}
          <textarea
            placeholder="Describe the emergency..."
            rows={5}
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />

          {/* Image */}
          <div>
            <label className="block mb-2 font-medium">
              Upload Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setImage(e.target.files[0]);
                }
              }}
              className="w-full border rounded-lg p-3"
            />

            {image && (
              <p className="text-green-600 text-sm mt-2">
                ✅ Selected File: {image.name}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg transition"
          >
            🚨 Submit Emergency Report
          </button>

        </form>
      </div>
    </div>
  );
}

export default ReportEmergency;