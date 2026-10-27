const { getContract } = require("../config/blockchain");
const ItemMetadata = require("../models/ItemMetadata");

const STATUS_MAP = ["Registered", "Collected", "InTransit", "ReceivedAtRecycler", "RecyclingCompleted"];

exports.getAnalytics = async (req, res) => {
  try {
    const contract = getContract();
    if (!contract) {
      return res.status(503).json({ success: false, message: "Contract not initialized" });
    }

    const itemIds = await contract.getAllItemIds();
    const statusCounts = {
      Registered: 0,
      Collected: 0,
      InTransit: 0,
      ReceivedAtRecycler: 0,
      RecyclingCompleted: 0,
    };

    let totalWeightGrams = 0;
    let totalRecycledWeightGrams = 0;
    const categoryDistribution = {};
    const participatingAddresses = new Set();

    for (const id of itemIds) {
      try {
        const item = await contract.getItem(id);
        const statusText = STATUS_MAP[Number(item.currentStatus)] || "Registered";
        statusCounts[statusText] = (statusCounts[statusText] || 0) + 1;
        totalWeightGrams += Number(item.weightGrams);

        participatingAddresses.add(item.registeredBy);

        const itemType = item.itemType || "Other";
        categoryDistribution[itemType] = (categoryDistribution[itemType] || 0) + 1;

        if (Number(item.currentStatus) === 4) {
          try {
            const cert = await contract.getRecyclingCertificate(id);
            totalRecycledWeightGrams += Number(cert.recoveredMaterialsWeightGrams);
            participatingAddresses.add(cert.recyclerAddress);
          } catch (e) {
            // No cert yet
          }
        }
      } catch (err) {
        // Skip unreadable
      }
    }

    // Environmental impact estimates
    // e.g. estimated CO2 savings: ~1.44 kg CO2 per kg of recycled e-waste
    const recycledKg = totalRecycledWeightGrams / 1000;
    const co2SavedKg = (recycledKg * 1.44).toFixed(2);
    const toxicLandfillDivertedKg = (totalWeightGrams / 1000).toFixed(2);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalItemsRegistered: itemIds.length,
        totalCompletedRecycling: statusCounts.RecyclingCompleted,
        activeInPipeline: itemIds.length - statusCounts.RecyclingCompleted,
        totalWeightKg: (totalWeightGrams / 1000).toFixed(2),
        totalRecycledKg: recycledKg.toFixed(2),
        recoveryRatePercent: totalWeightGrams > 0 ? ((totalRecycledWeightGrams / totalWeightGrams) * 100).toFixed(1) : 0,
        uniqueParticipantsCount: participatingAddresses.size,
      },
      statusBreakdown: statusCounts,
      categoryBreakdown: categoryDistribution,
      environmentalImpact: {
        estimatedCo2AvoidedKg: co2SavedKg,
        landfillDiversionKg: toxicLandfillDivertedKg,
        sustainableDevelopmentGoals: [
          {
            sdgNumber: 12,
            title: "Responsible Consumption and Production",
            target: "12.4 & 12.5: Substantially reduce waste generation through recycling and reuse",
          },
          {
            sdgNumber: 13,
            title: "Climate Action",
            target: "13.2: Integrate climate change measures into national policies and circular economy practices",
          },
          {
            sdgNumber: 9,
            title: "Industry, Innovation, and Infrastructure",
            target: "9.4: Upgrade infrastructure and retrofit industries to make them sustainable",
          },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Analytics error: " + error.message,
    });
  }
};
