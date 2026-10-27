const QRCode = require("qrcode");
const { getContract } = require("../config/blockchain");
const ItemMetadata = require("../models/ItemMetadata");

const STATUS_MAP = ["Registered", "Collected", "InTransit", "ReceivedAtRecycler", "RecyclingCompleted"];

const formatItem = (rawItem, metadata = null) => {
  return {
    itemId: rawItem.itemId,
    itemType: rawItem.itemType,
    brandModel: rawItem.brandModel,
    weightGrams: Number(rawItem.weightGrams),
    weightKg: (Number(rawItem.weightGrams) / 1000).toFixed(2),
    serialNumber: rawItem.serialNumber,
    registeredBy: rawItem.registeredBy,
    registrationTimestamp: Number(rawItem.registrationTimestamp),
    registrationDate: new Date(Number(rawItem.registrationTimestamp) * 1000).toISOString(),
    statusCode: Number(rawItem.currentStatus),
    statusText: STATUS_MAP[Number(rawItem.currentStatus)] || "Unknown",
    exists: rawItem.exists,
    metadata: metadata
      ? {
          category: metadata.category,
          hazardousMaterials: metadata.hazardousMaterials,
          estimatedValuationUSD: metadata.estimatedValuationUSD,
          notes: metadata.notes,
          dropoffPhotoUrl: metadata.dropoffPhotoUrl,
        }
      : null,
  };
};

const formatHistory = (rawHistory) => {
  return rawHistory.map((entry, index) => ({
    step: index + 1,
    statusCode: Number(entry.status),
    statusText: STATUS_MAP[Number(entry.status)] || "Unknown",
    updatedBy: entry.updatedBy,
    updaterRole: entry.updaterRole,
    timestamp: Number(entry.timestamp),
    date: new Date(Number(entry.timestamp) * 1000).toISOString(),
    location: entry.location,
    remarks: entry.remarks,
  }));
};

const formatCertificate = (rawCert) => {
  if (!rawCert || !rawCert.issued) return null;
  return {
    certificateId: rawCert.certificateId,
    itemId: rawCert.itemId,
    completionTimestamp: Number(rawCert.completionTimestamp),
    completionDate: new Date(Number(rawCert.completionTimestamp) * 1000).toISOString(),
    recyclerAddress: rawCert.recyclerAddress,
    recyclingFacility: rawCert.recyclingFacility,
    recoveryMethod: rawCert.recoveryMethod,
    recoveredMaterialsWeightGrams: Number(rawCert.recoveredMaterialsWeightGrams),
    recoveredMaterialsWeightKg: (Number(rawCert.recoveredMaterialsWeightGrams) / 1000).toFixed(2),
    hazardousWasteDisposalRef: rawCert.hazardousWasteDisposalRef,
    remarks: rawCert.remarks,
    issued: rawCert.issued,
  };
};

// GET /api/items
exports.getAllItems = async (req, res) => {
  try {
    const contract = getContract();
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: "Smart contract not initialized. Please ensure the contract is compiled and deployed.",
      });
    }

    const itemIds = await contract.getAllItemIds();
    const items = [];

    for (const id of itemIds) {
      try {
        const rawItem = await contract.getItem(id);
        let metadata = null;
        try {
          metadata = await ItemMetadata.findOne({ itemId: id });
        } catch (dbErr) {
          // Graceful fallback if MongoDB is not reachable
        }
        items.push(formatItem(rawItem, metadata));
      } catch (err) {
        console.error(`Error reading item ${id}:`, err.message);
      }
    }

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch items from blockchain: " + error.message,
    });
  }
};

// GET /api/items/:id
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = getContract();
    if (!contract) {
      return res.status(503).json({ success: false, message: "Contract not initialized" });
    }

    let rawItem;
    try {
      rawItem = await contract.getItem(id);
    } catch (contractErr) {
      return res.status(404).json({
        success: false,
        message: `E-Waste Item '${id}' was not found on the blockchain`,
      });
    }

    let rawHistory = [];
    try {
      rawHistory = await contract.getItemHistory(id);
    } catch (e) {
      console.warn("Could not retrieve history for item:", id);
    }

    let certificate = null;
    if (Number(rawItem.currentStatus) === 4) {
      try {
        const rawCert = await contract.getRecyclingCertificate(id);
        certificate = formatCertificate(rawCert);
      } catch (e) {
        console.warn("No certificate found for item:", id);
      }
    }

    let metadata = null;
    try {
      metadata = await ItemMetadata.findOne({ itemId: id });
    } catch (dbErr) {
      // Graceful fallback
    }

    const formattedItem = formatItem(rawItem, metadata);
    const history = formatHistory(rawHistory);

    res.json({
      success: true,
      data: {
        ...formattedItem,
        history,
        certificate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve item: " + error.message,
    });
  }
};

// GET /api/items/:id/history
exports.getItemHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = getContract();
    if (!contract) {
      return res.status(503).json({ success: false, message: "Contract not initialized" });
    }

    const rawHistory = await contract.getItemHistory(id);
    const history = formatHistory(rawHistory);

    res.json({
      success: true,
      itemId: id,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: `Audit history not found for item '${req.params.id}': ` + error.message,
    });
  }
};

// GET /api/items/:id/certificate
exports.getItemCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = getContract();
    if (!contract) {
      return res.status(503).json({ success: false, message: "Contract not initialized" });
    }

    const rawCert = await contract.getRecyclingCertificate(id);
    const certificate = formatCertificate(rawCert);

    if (!certificate || !certificate.issued) {
      return res.status(404).json({
        success: false,
        message: `No issued recycling certificate found for item '${id}'`,
      });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: `Recycling certificate lookup error for '${req.params.id}': ` + error.message,
    });
  }
};

// GET /api/items/:id/qr
exports.generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const qrPayload = JSON.stringify({
      system: "EcoChain",
      itemId: id,
      verifyUrl: `${frontendUrl}/track?id=${encodeURIComponent(id)}`,
      timestamp: Date.now(),
    });

    const qrDataUri = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      width: 320,
      color: {
        dark: "#064e3b",
        light: "#ffffff",
      },
    });

    res.json({
      success: true,
      itemId: id,
      qrDataUri,
      payload: qrPayload,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate QR code: " + error.message,
    });
  }
};

// POST /api/items/cache
exports.saveItemMetadata = async (req, res) => {
  try {
    const { itemId, category, hazardousMaterials, estimatedValuationUSD, notes, dropoffPhotoUrl } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, message: "itemId is required" });
    }

    const updated = await ItemMetadata.findOneAndUpdate(
      { itemId },
      {
        itemId,
        category: category || "Other Electronic Component",
        hazardousMaterials: Array.isArray(hazardousMaterials) ? hazardousMaterials : [],
        estimatedValuationUSD: estimatedValuationUSD || 0,
        notes: notes || "",
        dropoffPhotoUrl: dropoffPhotoUrl || "",
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: "Metadata cached successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error caching metadata: " + error.message,
    });
  }
};
