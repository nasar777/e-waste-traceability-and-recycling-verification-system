const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");

// List all registered items from contract
router.get("/", itemController.getAllItems);

// Save/update item off-chain metadata
router.post("/cache", itemController.saveItemMetadata);

// Get single item details with history & certificate
router.get("/:id", itemController.getItemById);

// Get chronological lifecycle history
router.get("/:id/history", itemController.getItemHistory);

// Get recycling certificate
router.get("/:id/certificate", itemController.getItemCertificate);

// Generate QR code for item
router.get("/:id/qr", itemController.generateQRCode);

module.exports = router;
