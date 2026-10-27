const { ethers } = require("ethers");
const { getContract, ROLE_HASHES, getDeploymentInfo } = require("../config/blockchain");

exports.checkAddressRoles = async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ethereum address format",
      });
    }

    const contract = getContract();
    if (!contract) {
      return res.status(503).json({ success: false, message: "Contract not initialized" });
    }

    const rolesTuple = await contract.checkUserRoles(address);
    const isAdmin = Boolean(rolesTuple[0]);
    const isCollectionCentre = Boolean(rolesTuple[1]);
    const isTransporter = Boolean(rolesTuple[2]);
    const isRecycler = Boolean(rolesTuple[3]);

    const activeRoles = [];
    if (isAdmin) activeRoles.push("Administrator");
    if (isCollectionCentre) activeRoles.push("Collection Centre");
    if (isTransporter) activeRoles.push("Transporter");
    if (isRecycler) activeRoles.push("Recycler");
    if (activeRoles.length === 0) activeRoles.push("Consumer / Public");

    res.json({
      success: true,
      address,
      roles: {
        isAdmin,
        isCollectionCentre,
        isTransporter,
        isRecycler,
      },
      activeRoles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Role lookup error: " + error.message,
    });
  }
};

exports.getPreconfiguredRoles = async (req, res) => {
  try {
    const info = getDeploymentInfo();
    res.json({
      success: true,
      contractAddress: info.address,
      roles: info.roles || {},
      roleHashes: ROLE_HASHES,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Preconfigured roles lookup error: " + error.message,
    });
  }
};
