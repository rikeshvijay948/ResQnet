require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// Report Schema
// ===============================

const reportSchema = new mongoose.Schema(
  {
    fullName: String,
    phoneNumber: String,
    emergencyContact: String,
    location: String,

    latitude: Number,
    longitude: Number,

    disasterType: String,
    severity: String,
    peopleAffected: Number,
    description: String,

    status: {
      type: String,
      enum: [
        "Reported",
        "Acknowledged",
        "Responding",
        "Resolved",
      ],
      default: "Reported",
    },
  },
  {
    timestamps: true,
  }
);

// ===============================
// Report Model
// ===============================

const Report = mongoose.model("Report", reportSchema);

// ===============================
// MongoDB Connection
// ===============================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing from .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(error);
  });

// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {
  res.send("🚀 ResQNet Backend is Running!");
});

// ===============================
// POST - Create Emergency Report
// ===============================

app.post("/report", async (req, res) => {
  try {
    console.log("📩 Emergency Report Received");

    console.log("Report Data:");
    console.log(req.body);

    const newReport = new Report({
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      emergencyContact: req.body.emergencyContact,
      location: req.body.location,

      // GPS
      latitude: req.body.latitude,
      longitude: req.body.longitude,

      disasterType: req.body.disasterType,
      severity: req.body.severity,
      peopleAffected: req.body.peopleAffected,
      description: req.body.description,
    });

    await newReport.save();

    console.log("✅ Report Saved to MongoDB");
    console.log("📍 Latitude:", newReport.latitude);
    console.log("📍 Longitude:", newReport.longitude);

    res.json({
      success: true,
      message: "Emergency report saved successfully!",
      report: newReport,
    });
  } catch (error) {
    console.error("❌ Error saving report:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save emergency report",
      error: error.message,
    });
  }
});

// ===============================
// GET - Get All Emergency Reports
// ===============================

app.get("/reports", async (req, res) => {
  try {
    console.log("📥 GET /reports called");

    console.log(
      "MongoDB connection state:",
      mongoose.connection.readyState
    );

    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${reports.length} reports`);

    res.json({
      success: true,
      reports: reports,
    });
  } catch (error) {
    console.error("❌ ERROR FETCHING REPORTS:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
});
// ===============================
// PUT - Update Emergency Status
// ===============================

app.put("/reports/:id/status", async (req, res) => {
  try {
    const { status, assignedTeam } = req.body;

    const allowedStatuses = [
      "Pending",
      "Verified",
      "Rescue Assigned",
      "In Progress",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency status",
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        assignedTeam: assignedTeam || "",
      },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: "Emergency report not found",
      });
    }

    console.log(
      `🔄 Emergency ${req.params.id} updated to ${status}`
    );

    res.json({
      success: true,
      message: "Emergency status updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error("❌ Error updating emergency status:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update emergency status",
    });
  }
});

// ===============================
// Start Server
// ===============================

const PORT = 5000;
// ===============================
// PUT - Update Emergency Status
// ===============================

app.put("/reports/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Reported",
      "Acknowledged",
      "Responding",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    console.log(
      `🔄 Report ${req.params.id} status changed to ${status}`
    );

    res.json({
      success: true,
      message: "Status updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error("❌ Error updating status:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
});
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});