import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ReportEmergency from "./pages/ReportEmergency";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/report-emergency"
          element={<ReportEmergency />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;