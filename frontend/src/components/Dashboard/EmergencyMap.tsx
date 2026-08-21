import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Report {
  _id: string;
  fullName: string;
  phoneNumber?: string;
  emergencyContact?: string;
  location: string;

  latitude?: number | null;
  longitude?: number | null;

  disasterType: string;
  severity: string;
  peopleAffected: number;
  description?: string;

  status?: string;
  createdAt?: string;
}

interface EmergencyMapProps {
  reports: Report[];
}

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function EmergencyMap({ reports }: EmergencyMapProps) {
  // Only show reports that have valid GPS coordinates
  const reportsWithLocation = reports.filter(
    (report) =>
      typeof report.latitude === "number" &&
      typeof report.longitude === "number"
  );

  // Center map on first emergency report
  // If there are no coordinates, center on India
  const defaultCenter: [number, number] =
    reportsWithLocation.length > 0
      ? [
          reportsWithLocation[0].latitude!,
          reportsWithLocation[0].longitude!,
        ]
      : [20.5937, 78.9629];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
      {/* Map Header */}
      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          🗺️ Emergency Location Map
        </h2>

        <p className="text-gray-500 mt-1">
          Live geographical view of reported emergencies
        </p>
      </div>

      {/* Map */}
      <div className="h-[500px]">
        <MapContainer
          center={defaultCenter}
          zoom={6}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Emergency Markers */}
          {reportsWithLocation.map((report) => (
            <Marker
              key={report._id}
              position={[
                report.latitude!,
                report.longitude!,
              ]}
              icon={markerIcon}
            >
              <Popup>
                <div className="space-y-2 min-w-[200px]">
                  <h3 className="font-bold text-lg">
                    🚨 {report.disasterType}
                  </h3>

                  <p>
                    <strong>Reported by:</strong>{" "}
                    {report.fullName}
                  </p>

                  <p>
                    <strong>Severity:</strong>{" "}
                    {report.severity}
                  </p>

                  <p>
                    <strong>People affected:</strong>{" "}
                    {report.peopleAffected}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {report.location || "GPS Location"}
                  </p>

                  <p className="text-xs text-gray-500">
                    Coordinates:{" "}
                    {report.latitude?.toFixed(5)},{" "}
                    {report.longitude?.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* No GPS Reports */}
      {reportsWithLocation.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No emergency reports with GPS coordinates yet.
        </p>
      )}
    </div>
  );
}

export default EmergencyMap;