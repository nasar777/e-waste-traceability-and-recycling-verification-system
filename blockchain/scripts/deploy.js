const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log("  EcoChain Smart Contract Deployment");
  console.log("==================================================");

  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  const collectionCentre = signers[1] || deployer;
  const transporter = signers[2] || deployer;
  const recycler = signers[3] || deployer;
  const consumer = signers[4] || deployer;

  console.log(`Deploying with account: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  const EcoChain = await hre.ethers.getContractFactory("EcoChain");
  const ecoChain = await EcoChain.deploy();
  await ecoChain.waitForDeployment();

  const contractAddress = await ecoChain.getAddress();
  console.log(`>>> EcoChain deployed successfully to: ${contractAddress}`);

  // Role hashes
  const COLLECTION_CENTRE_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("COLLECTION_CENTRE_ROLE"));
  const TRANSPORTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TRANSPORTER_ROLE"));
  const RECYCLER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("RECYCLER_ROLE"));

  // Grant roles to simulated participants if distinct accounts exist
  if (signers.length >= 4) {
    console.log("\nConfiguring Initial Pre-Authorized Roles for Development Network:");
    console.log(`- Admin:             ${deployer.address}`);
    console.log(`- Collection Centre: ${collectionCentre.address}`);
    console.log(`- Transporter:       ${transporter.address}`);
    console.log(`- Recycler:          ${recycler.address}`);
    console.log(`- Demo Consumer:     ${consumer.address}`);

    const tx1 = await ecoChain.grantRole(COLLECTION_CENTRE_ROLE, collectionCentre.address);
    await tx1.wait();
    console.log("✔ COLLECTION_CENTRE_ROLE granted to account 1");

    const tx2 = await ecoChain.grantRole(TRANSPORTER_ROLE, transporter.address);
    await tx2.wait();
    console.log("✔ TRANSPORTER_ROLE granted to account 2");

    const tx3 = await ecoChain.grantRole(RECYCLER_ROLE, recycler.address);
    await tx3.wait();
    console.log("✔ RECYCLER_ROLE granted to account 3");

    // Seed 2 initial demonstration items
    console.log("\nSeeding initial demonstration e-waste items...");
    const seedTx1 = await ecoChain.connect(consumer).registerItem(
      "EW-DEMO-001",
      "Smartphone",
      "iPhone 12 Pro (Pacific Blue)",
      189,
      "F2LZ69Q00D9G",
      "San Jose Drop-off Kiosk",
      "Battery degradation, cracked back glass"
    );
    await seedTx1.wait();
    console.log("✔ Seeded EW-DEMO-001 (Status: Registered)");

    const seedTx2 = await ecoChain.connect(consumer).registerItem(
      "EW-DEMO-002",
      "Laptop",
      "ThinkPad T14 Gen 2",
      1460,
      "PF2981XXM",
      "Tech Recycling Depot Central",
      "Motherboard component failure"
    );
    await seedTx2.wait();

    const collTx2 = await ecoChain.connect(collectionCentre).confirmCollection(
      "EW-DEMO-002",
      "Central Electronics Depot",
      "Inspected and inventoried in batch #882"
    );
    await collTx2.wait();

    const transTx2 = await ecoChain.connect(transporter).updateTransitStatus(
      "EW-DEMO-002",
      "Bay Area Interstate Transit",
      "Loaded on logistics truck eco-fleet #5"
    );
    await transTx2.wait();
    console.log("✔ Seeded EW-DEMO-002 (Status: InTransit)");
  }

  // Export deployment metadata
  const artifactPath = path.join(__dirname, "../artifacts/contracts/EcoChain.sol/EcoChain.json");
  const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    roles: {
      admin: deployer.address,
      collectionCentre: collectionCentre.address,
      transporter: transporter.address,
      recycler: recycler.address,
      consumer: consumer.address,
    },
    abi: contractArtifact.abi,
  };

  const sharedDir = path.join(__dirname, "../../shared");
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(sharedDir, "contract-deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log(`\n✔ Saved deployment artifact to: ${path.join(sharedDir, "contract-deployment.json")}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
