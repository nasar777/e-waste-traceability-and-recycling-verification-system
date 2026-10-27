const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { isBlockchainConnected, getDeploymentInfo, getContract } = require("../config/blockchain");

router.get("/", async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  const blockchainStatus = await isBlockchainConnected();
  const deploymentInfo = getDeploymentInfo();
  const contract = getContract();

  res.json({
    success: true,
    service: "EcoChain Backend API",
    status: "Healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    components: {
      mongodb: {
        status: mongoStatus,
        host: mongoose.connection.host || null,
        name: mongoose.connection.name || null,
      },
      blockchain: {
        status: blockchainStatus.connected ? "Connected" : "Disconnected",
        chainId: blockchainStatus.chainId,
        currentBlock: blockchainStatus.blockNumber,
        rpcUrl: blockchainStatus.rpcUrl,
        error: blockchainStatus.error || null,
      },
      contract: {
        deployed: Boolean(contract),
        address: deploymentInfo.address || null,
        network: deploymentInfo.network || null,
        abiFunctionsCount: deploymentInfo.abi ? deploymentInfo.abi.filter(item => item.type === "function").length : 0,
      },
    },
  });
});

module.exports = router;
