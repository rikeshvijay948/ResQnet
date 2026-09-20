import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Common/ProtectedRoute";

import Home from "./pages/Home";
import ReportEmergency from "./pages/ReportEmergency";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import TrackEmergency from "./pages/TrackEmergency";
import VolunteerDashboard from "./pages/Volunteer/VolunteerDashboard";
import CitizenDashboard from "./pages/Citizen/CitizenDashboard";
import AnalyticsDashboard from "./pages/Analytics/AnalyticsDashboard";
import ResourceManager from "./pages/Resources/ResourceManager";
import FacilitiesDirectory from "./pages/Facilities/FacilitiesDirectory";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/report-emergency" element={<ReportEmergency />} />
          <Route path="/track" element={<TrackEmergency />} />
          <Route path="/track/:id" element={<TrackEmergency />} />

          {/* Core Operations & Analytics */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/resources" element={<ResourceManager />} />
          <Route path="/facilities" element={<FacilitiesDirectory />} />

          {/* Volunteer Responder Workspace (Protected) */}
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["volunteer", "admin"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Citizen Portal (Protected) */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allowedRoles={["citizen", "volunteer", "admin"]}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;