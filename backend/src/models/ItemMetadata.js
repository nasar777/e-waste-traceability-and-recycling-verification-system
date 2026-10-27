const mongoose = require("mongoose");

const ItemMetadataSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Smartphone",
        "Laptop",
        "Desktop Computer",
        "Tablet",
        "Television & Display",
        "Household Appliance",
        "Battery & Power Supply",
        "Printed Circuit Board (PCB)",
        "Audio / Visual Equipment",
        "Other Electronic Component",
      ],
      default: "Other Electronic Component",
    },
    hazardousMaterials: [
      {
        type: String,
        trim: true,
      },
    ],
    estimatedValuationUSD: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    dropoffPhotoUrl: {
      type: String,
      default: "",
    },
    cachedStatus: {
      type: String,
      enum: ["Registered", "Collected", "InTransit", "ReceivedAtRecycler", "RecyclingCompleted"],
      default: "Registered",
    },
    searchTags: [
      {
        type: String,
      },
    ],
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ItemMetadata", ItemMetadataSchema);
