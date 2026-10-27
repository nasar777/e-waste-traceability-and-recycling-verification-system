const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoChain Smart Contract", function () {
  let ecoChain;
  let admin, collectionCentre, transporter, recycler, consumer, unauthorizedUser;

  const COLLECTION_CENTRE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COLLECTION_CENTRE_ROLE"));
  const TRANSPORTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TRANSPORTER_ROLE"));
  const RECYCLER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RECYCLER_ROLE"));
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

  const sampleItem = {
    id: "EW-2026-TEST01",
    type: "Smartphone",
    brandModel: "EcoPhone Pro 5G",
    weightGrams: 210,
    serialNumber: "SN-9876543210",
    location: "Greenwich Drop-off Hub, Zone 4",
    remarks: "Cracked screen, lithium battery intact",
  };

  beforeEach(async function () {
    [admin, collectionCentre, transporter, recycler, consumer, unauthorizedUser] =
      await ethers.getSigners();

    const EcoChainFactory = await ethers.getContractFactory("EcoChain");
    ecoChain = await EcoChainFactory.deploy();
    await ecoChain.waitForDeployment();

    // Grant roles from admin
    await ecoChain.connect(admin).grantRole(COLLECTION_CENTRE_ROLE, collectionCentre.address);
    await ecoChain.connect(admin).grantRole(TRANSPORTER_ROLE, transporter.address);
    await ecoChain.connect(admin).grantRole(RECYCLER_ROLE, recycler.address);
  });

  describe("1. Deployment and Access Control Setup", function () {
    it("Should set the deployer as DEFAULT_ADMIN_ROLE", async function () {
      expect(await ecoChain.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should correctly assign initial participant roles", async function () {
      expect(await ecoChain.hasRole(COLLECTION_CENTRE_ROLE, collectionCentre.address)).to.be.true;
      expect(await ecoChain.hasRole(TRANSPORTER_ROLE, transporter.address)).to.be.true;
      expect(await ecoChain.hasRole(RECYCLER_ROLE, recycler.address)).to.be.true;
      expect(await ecoChain.hasRole(COLLECTION_CENTRE_ROLE, unauthorizedUser.address)).to.be.false;
    });

    it("Should allow admin to revoke and re-grant roles", async function () {
      await ecoChain.connect(admin).revokeRole(COLLECTION_CENTRE_ROLE, collectionCentre.address);
      expect(await ecoChain.hasRole(COLLECTION_CENTRE_ROLE, collectionCentre.address)).to.be.false;

      await ecoChain.connect(admin).grantRole(COLLECTION_CENTRE_ROLE, collectionCentre.address);
      expect(await ecoChain.hasRole(COLLECTION_CENTRE_ROLE, collectionCentre.address)).to.be.true;
    });

    it("Should reject non-admin attempting to grant roles", async function () {
      await expect(
        ecoChain.connect(unauthorizedUser).grantRole(COLLECTION_CENTRE_ROLE, unauthorizedUser.address)
      ).to.be.revertedWithCustomError(ecoChain, "AccessControlUnauthorizedAccount");
    });

    it("Should accurately return roles via checkUserRoles helper", async function () {
      const adminRoles = await ecoChain.checkUserRoles(admin.address);
      expect(adminRoles.isAdmin).to.be.true;
      expect(adminRoles.isCollectionCentre).to.be.false;

      const ccRoles = await ecoChain.checkUserRoles(collectionCentre.address);
      expect(ccRoles.isAdmin).to.be.false;
      expect(ccRoles.isCollectionCentre).to.be.true;
    });
  });

  describe("2. Item Registration", function () {
    it("Should allow consumer to register new e-waste item", async function () {
      const tx = await ecoChain.connect(consumer).registerItem(
        sampleItem.id,
        sampleItem.type,
        sampleItem.brandModel,
        sampleItem.weightGrams,
        sampleItem.serialNumber,
        sampleItem.location,
        sampleItem.remarks
      );

      await expect(tx)
        .to.emit(ecoChain, "ItemRegistered")
        .withArgs(
          sampleItem.id,
          sampleItem.type,
          sampleItem.brandModel,
          sampleItem.weightGrams,
          consumer.address,
          await ethers.provider.getBlock("latest").then(b => b.timestamp)
        );

      const item = await ecoChain.getItem(sampleItem.id);
      expect(item.itemId).to.equal(sampleItem.id);
      expect(item.itemType).to.equal(sampleItem.type);
      expect(item.registeredBy).to.equal(consumer.address);
      expect(item.currentStatus).to.equal(0); // Registered
      expect(item.exists).to.be.true;

      expect(await ecoChain.getItemCount()).to.equal(1);
      expect(await ecoChain.totalRegisteredItems()).to.equal(1);
    });

    it("Should reject duplicate item IDs", async function () {
      await ecoChain.connect(consumer).registerItem(
        sampleItem.id,
        sampleItem.type,
        sampleItem.brandModel,
        sampleItem.weightGrams,
        sampleItem.serialNumber,
        sampleItem.location,
        sampleItem.remarks
      );

      await expect(
        ecoChain.connect(consumer).registerItem(
          sampleItem.id,
          sampleItem.type,
          sampleItem.brandModel,
          sampleItem.weightGrams,
          sampleItem.serialNumber,
          sampleItem.location,
          sampleItem.remarks
        )
      ).to.be.revertedWith("EcoChain: Item ID already exists");
    });

    it("Should reject item registration with empty ID or empty type", async function () {
      await expect(
        ecoChain.connect(consumer).registerItem(
          "",
          sampleItem.type,
          sampleItem.brandModel,
          sampleItem.weightGrams,
          sampleItem.serialNumber,
          sampleItem.location,
          sampleItem.remarks
        )
      ).to.be.revertedWith("EcoChain: Item ID cannot be empty");

      await expect(
        ecoChain.connect(consumer).registerItem(
          "EW-VALID-01",
          "",
          sampleItem.brandModel,
          sampleItem.weightGrams,
          sampleItem.serialNumber,
          sampleItem.location,
          sampleItem.remarks
        )
      ).to.be.revertedWith("EcoChain: Item type cannot be empty");
    });
  });

  describe("3. Lifecycle State Transitions and RBAC Enforcement", function () {
    beforeEach(async function () {
      await ecoChain.connect(consumer).registerItem(
        sampleItem.id,
        sampleItem.type,
        sampleItem.brandModel,
        sampleItem.weightGrams,
        sampleItem.serialNumber,
        sampleItem.location,
        sampleItem.remarks
      );
    });

    it("Should allow Collection Centre to confirm collection", async function () {
      const tx = await ecoChain.connect(collectionCentre).confirmCollection(
        sampleItem.id,
        "Regional Collection Depot 12",
        "Physical item verified against serial number"
      );

      await expect(tx)
        .to.emit(ecoChain, "StatusUpdated")
        .withArgs(
          sampleItem.id,
          1, // Collected
          collectionCentre.address,
          "Collection Centre",
          "Regional Collection Depot 12",
          "Physical item verified against serial number",
          await ethers.provider.getBlock("latest").then(b => b.timestamp)
        );

      const item = await ecoChain.getItem(sampleItem.id);
      expect(item.currentStatus).to.equal(1); // Collected
    });

    it("Should reject unauthorized account attempting collection confirmation", async function () {
      await expect(
        ecoChain.connect(unauthorizedUser).confirmCollection(
          sampleItem.id,
          "Unauthorized Spot",
          "Unauthorized"
        )
      ).to.be.revertedWithCustomError(ecoChain, "AccessControlUnauthorizedAccount");
    });

    it("Should reject transporter jumping ahead before collection", async function () {
      await expect(
        ecoChain.connect(transporter).updateTransitStatus(
          sampleItem.id,
          "Highway A1 South",
          "Truck dispatched"
        )
      ).to.be.revertedWith("EcoChain: Invalid status transition. Item must be 'Collected' or 'InTransit'");
    });

    it("Should allow transporter to update transit status after collection", async function () {
      await ecoChain.connect(collectionCentre).confirmCollection(
        sampleItem.id,
        "Depot 12",
        "Collected"
      );

      const tx = await ecoChain.connect(transporter).updateTransitStatus(
        sampleItem.id,
        "Interstate Transfer Hub Beta",
        "Container sealed in logistics vehicle #TX-402"
      );

      await expect(tx).to.emit(ecoChain, "StatusUpdated");

      const item = await ecoChain.getItem(sampleItem.id);
      expect(item.currentStatus).to.equal(2); // InTransit

      // Additional checkpoint while in transit
      await ecoChain.connect(transporter).updateTransitStatus(
        sampleItem.id,
        "Checkpoint Delta",
        "En route to recycling plant"
      );

      const history = await ecoChain.getItemHistory(sampleItem.id);
      expect(history.length).to.equal(4); // Registered + Collected + InTransit 1 + InTransit 2
    });

    it("Should reject recycler receiving item before transit begins", async function () {
      await expect(
        ecoChain.connect(recycler).confirmRecyclerReceipt(
          sampleItem.id,
          "EcoRecycle Facility Gate 2",
          "Premature receipt"
        )
      ).to.be.revertedWith("EcoChain: Invalid status transition. Item must be 'InTransit'");
    });

    it("Should allow recycler to confirm receipt when InTransit", async function () {
      await ecoChain.connect(collectionCentre).confirmCollection(sampleItem.id, "Depot 12", "Collected");
      await ecoChain.connect(transporter).updateTransitStatus(sampleItem.id, "Logistics Van", "In Transit");

      await ecoChain.connect(recycler).confirmRecyclerReceipt(
        sampleItem.id,
        "Advanced Metals Recovery Facility",
        "Package received, barcode verified"
      );

      const item = await ecoChain.getItem(sampleItem.id);
      expect(item.currentStatus).to.equal(3); // ReceivedAtRecycler
    });
  });

  describe("4. Recycling Completion and Certificate Issuance", function () {
    const certData = {
      id: "CERT-2026-RECYCLE-8801",
      facility: "CleanTech Recyclers Plant 01, ISO 14001 Certified",
      method: "Hydrometallurgical Precious Metals Extraction & Plastics Shredding",
      recoveredWeight: 185, // grams recovered
      hazardousRef: "HAZ-EPA-2026-9932 (Lithium safe neutralisation)",
      remarks: "Gold, Copper, and high-impact polystyrene recovered for circular supply chain",
    };

    beforeEach(async function () {
      await ecoChain.connect(consumer).registerItem(
        sampleItem.id,
        sampleItem.type,
        sampleItem.brandModel,
        sampleItem.weightGrams,
        sampleItem.serialNumber,
        sampleItem.location,
        sampleItem.remarks
      );
      await ecoChain.connect(collectionCentre).confirmCollection(sampleItem.id, "Hub A", "Collected");
      await ecoChain.connect(transporter).updateTransitStatus(sampleItem.id, "Transit Van 1", "Dispatched");
      await ecoChain.connect(recycler).confirmRecyclerReceipt(sampleItem.id, certData.facility, "Dock receipt");
    });

    it("Should complete full lifecycle and issue verifiable certificate", async function () {
      const tx = await ecoChain.connect(recycler).completeRecycling(
        sampleItem.id,
        certData.id,
        certData.facility,
        certData.method,
        certData.recoveredWeight,
        certData.hazardousRef,
        certData.remarks
      );

      await expect(tx)
        .to.emit(ecoChain, "RecyclingCompletedEvent")
        .withArgs(
          sampleItem.id,
          certData.id,
          recycler.address,
          certData.facility,
          certData.method,
          certData.recoveredWeight,
          await ethers.provider.getBlock("latest").then(b => b.timestamp)
        );

      const item = await ecoChain.getItem(sampleItem.id);
      expect(item.currentStatus).to.equal(4); // RecyclingCompleted

      const cert = await ecoChain.getRecyclingCertificate(sampleItem.id);
      expect(cert.certificateId).to.equal(certData.id);
      expect(cert.recyclerAddress).to.equal(recycler.address);
      expect(cert.recoveredMaterialsWeightGrams).to.equal(certData.recoveredWeight);
      expect(cert.hazardousWasteDisposalRef).to.equal(certData.hazardousRef);
      expect(cert.issued).to.be.true;

      const metrics = await ecoChain.getSystemMetrics();
      expect(metrics.totalCompleted).to.equal(1);
    });

    it("Should reject duplicate certificate issuance", async function () {
      await ecoChain.connect(recycler).completeRecycling(
        sampleItem.id,
        certData.id,
        certData.facility,
        certData.method,
        certData.recoveredWeight,
        certData.hazardousRef,
        certData.remarks
      );

      await expect(
        ecoChain.connect(recycler).completeRecycling(
          sampleItem.id,
          "CERT-DUPLICATE",
          certData.facility,
          certData.method,
          certData.recoveredWeight,
          certData.hazardousRef,
          certData.remarks
        )
      ).to.be.revertedWith("EcoChain: Invalid status transition. Item must be 'ReceivedAtRecycler'");
    });

    it("Should reject unauthorized user completing recycling", async function () {
      await expect(
        ecoChain.connect(consumer).completeRecycling(
          sampleItem.id,
          certData.id,
          certData.facility,
          certData.method,
          certData.recoveredWeight,
          certData.hazardousRef,
          certData.remarks
        )
      ).to.be.revertedWithCustomError(ecoChain, "AccessControlUnauthorizedAccount");
    });
  });

  describe("5. Audit History and Query Integrity", function () {
    it("Should maintain full chronological immutable audit trail", async function () {
      await ecoChain.connect(consumer).registerItem(
        sampleItem.id,
        sampleItem.type,
        sampleItem.brandModel,
        sampleItem.weightGrams,
        sampleItem.serialNumber,
        "Origin Hub",
        "Consumer dropped off"
      );
      await ecoChain.connect(collectionCentre).confirmCollection(sampleItem.id, "Collection Depot", "Inspected");
      await ecoChain.connect(transporter).updateTransitStatus(sampleItem.id, "Highway Toll 3", "In transit");
      await ecoChain.connect(recycler).confirmRecyclerReceipt(sampleItem.id, "Recycling Plant", "Arrived");
      await ecoChain.connect(recycler).completeRecycling(
        sampleItem.id,
        "CERT-FINAL",
        "Recycling Plant",
        "Mechanical Dismantling",
        200,
        "HAZ-NONE",
        "Complete"
      );

      const history = await ecoChain.getItemHistory(sampleItem.id);
      expect(history.length).to.equal(5);

      expect(history[0].status).to.equal(0); // Registered
      expect(history[0].updaterRole).to.equal("Consumer");

      expect(history[1].status).to.equal(1); // Collected
      expect(history[1].updaterRole).to.equal("Collection Centre");

      expect(history[2].status).to.equal(2); // InTransit
      expect(history[2].updaterRole).to.equal("Transporter");

      expect(history[3].status).to.equal(3); // ReceivedAtRecycler
      expect(history[3].updaterRole).to.equal("Recycler");

      expect(history[4].status).to.equal(4); // RecyclingCompleted
      expect(history[4].updaterRole).to.equal("Recycler");
    });

    it("Should revert when querying non-existent item or certificate", async function () {
      await expect(ecoChain.getItem("NON-EXISTENT")).to.be.revertedWith("EcoChain: Item not found");
      await expect(ecoChain.getItemHistory("NON-EXISTENT")).to.be.revertedWith("EcoChain: Item not found");
      await expect(ecoChain.getRecyclingCertificate("NON-EXISTENT")).to.be.revertedWith("EcoChain: Item not found");
    });
  });
});
