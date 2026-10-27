require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");
const { getDeploymentInfo } = require("./config/blockchain");

const healthRoutes = require("./routes/healthRoutes");
const itemRoutes = require("./routes/itemRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const roleRoutes = require("./routes/roleRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Root Welcome Endpoint
app.get("/", (req, res) => {
  res.json({
    project: "EcoChain: Blockchain-Based E-Waste Traceability & Recycling Verification System",
    version: "1.0.0",
    docs: "/api/health",
    endpoints: {
      health: "/api/health",
      contractInfo: "/api/contract/info",
      items: "/api/items",
      analytics: "/api/analytics",
      roles: "/api/roles/preconfigured",
    },
  });
});

// Contract info endpoint
app.get("/api/contract/info", (req, res) => {
  const info = getDeploymentInfo();
  res.json({
    success: true,
    data: info,
  });
});

// Route mounts
app.use("/api/health", healthRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/roles", roleRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Backend Error]", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Server Initialization
const startServer = async () => {
  console.log("==================================================");
  console.log("  EcoChain Backend Service Starting");
  console.log("==================================================");

  await connectDB();

  app.listen(PORT, () => {
    console.log(`>>> EcoChain API Server running on http://localhost:${PORT}`);
    console.log(`>>> Health endpoint: http://localhost:${PORT}/api/health`);
    console.log("==================================================");
  });
};

startServer();
