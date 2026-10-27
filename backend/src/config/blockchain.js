const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(RPC_URL);

let cachedContract = null;
let deploymentInfo = null;

const getDeploymentInfo = () => {
  if (deploymentInfo) return deploymentInfo;

  const deploymentPath = path.join(__dirname, "../../../shared/contract-deployment.json");
  if (fs.existsSync(deploymentPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
      deploymentInfo = data;
      return deploymentInfo;
    } catch (e) {
      console.error("[Blockchain Config] Error parsing contract-deployment.json:", e.message);
    }
  }

  // Fallback if shared file doesn't exist yet
  return {
    address: process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    network: "localhost",
    chainId: 31337,
    abi: [],
  };
};

const getContract = () => {
  const info = getDeploymentInfo();
  if (!info.address || !info.abi || info.abi.length === 0) {
    // If ABI is missing, attempt to read from artifacts directly
    const artifactPath = path.join(__dirname, "../../../blockchain/artifacts/contracts/EcoChain.sol/EcoChain.json");
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      info.abi = artifact.abi;
    }
  }

  if (cachedContract && cachedContract.target === info.address) {
    return cachedContract;
  }

  if (info.address && info.abi && info.abi.length > 0) {
    cachedContract = new ethers.Contract(info.address, info.abi, provider);
    return cachedContract;
  }

  return null;
};

const isBlockchainConnected = async () => {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    return {
      connected: true,
      chainId: Number(network.chainId),
      blockNumber,
      rpcUrl: RPC_URL,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      rpcUrl: RPC_URL,
    };
  }
};

const ROLE_HASHES = {
  DEFAULT_ADMIN_ROLE: ethers.ZeroHash,
  COLLECTION_CENTRE_ROLE: ethers.keccak256(ethers.toUtf8Bytes("COLLECTION_CENTRE_ROLE")),
  TRANSPORTER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("TRANSPORTER_ROLE")),
  RECYCLER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("RECYCLER_ROLE")),
};

module.exports = {
  provider,
  getDeploymentInfo,
  getContract,
  isBlockchainConnected,
  ROLE_HASHES,
};
