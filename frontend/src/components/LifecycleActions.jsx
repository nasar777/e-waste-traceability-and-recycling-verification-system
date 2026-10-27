import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useWallet } from "../context/WalletContext";
import { fetchAllItems } from "../services/api";
import {
  PackageCheck,
  Truck,
  Recycle,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info
} from "lucide-react";

export default function LifecycleActions({ onViewCertificate, onActionCompleted }) {
  const { contract, account, roles, selectedPresetIndex, selectPresetAccount, refreshWalletState } = useWallet();

  const [activeSubTab, setActiveSubTab] = useState("collection");
  const [allItems, setAllItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Automatically sync active tab when role or preset account changes
  useEffect(() => {
    if (selectedPresetIndex === 2 || roles.isTransporter) {
      setActiveSubTab("transit");
    } else if (selectedPresetIndex === 3 || roles.isRecycler) {
      setActiveSubTab("recycler");
    } else if (selectedPresetIndex === 1 || roles.isCollectionCentre) {
      setActiveSubTab("collection");
    }
  }, [selectedPresetIndex, roles.isTransporter, roles.isRecycler, roles.isCollectionCentre]);

  // Form states
  const [collectionForm, setCollectionForm] = useState({
    itemId: "",
    location: "Metro Regional Collection Depot 12, Bay 4",
    remarks: "Physical intake verified. Item weighed, inspected, and serialized.",
  });

  const [transitForm, setTransitForm] = useState({
    itemId: "",
    location: "Interstate Logistics Corridor Alpha, Truck #FL-88",
    remarks: "Cargo pallet sealed and en route to authorized recycling facility.",
  });

  const [receiptForm, setReceiptForm] = useState({
    itemId: "",
    location: "CleanTech Advanced Recovery Plant, Gate 2",
    remarks: "Freight shipment received. Security seals intact and scanned.",
  });

  const [completeForm, setCompleteForm] = useState({
    itemId: "",
    certificateId: `CERT-2026-REC-${Math.floor(1000 + Math.random() * 9000)}`,
    facility: "CleanTech Advanced Recovery Plant, ISO 14001",
    recoveryMethod: "Hydrometallurgical Precious Metals Extraction & Plastics Shredding",
    recoveredWeightGrams: "185",
    hazardousRef: `HAZ-EPA-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    remarks: "Gold, Copper, and high-impact polystyrene recovered for circular supply chain.",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoadingItems(true);
      const res = await fetchAllItems();
      if (res.success) {
        setAllItems(res.data);
        // Pre-select first eligible item if empty
        const registered = res.data.filter((i) => i.statusCode === 0);
        if (registered.length > 0 && !collectionForm.itemId) {
          setCollectionForm((p) => ({ ...p, itemId: registered[0].itemId }));
        }

        const collected = res.data.filter((i) => i.statusCode === 1 || i.statusCode === 2);
        if (collected.length > 0 && !transitForm.itemId) {
          setTransitForm((p) => ({ ...p, itemId: collected[0].itemId }));
        }

        const inTransit = res.data.filter((i) => i.statusCode === 2);
        if (inTransit.length > 0 && !receiptForm.itemId) {
          setReceiptForm((p) => ({ ...p, itemId: inTransit[0].itemId }));
        }

        const received = res.data.filter((i) => i.statusCode === 3);
        if (received.length > 0 && !completeForm.itemId) {
          setCompleteForm((p) => ({ ...p, itemId: received[0].itemId }));
        }
      }
    } catch (e) {
      console.warn("Error fetching items for lifecycle actions:", e);
    } finally {
      setLoadingItems(false);
    }
  };

  // --- Handlers ---

  const handleConfirmCollection = async (e) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess(null);

    const hasPermission = roles.isCollectionCentre || roles.isAdmin || selectedPresetIndex === 1;
    if (!hasPermission) {
      setActionError("Access Denied: Your current account does not have COLLECTION_CENTRE_ROLE. Please switch to the Collection Centre account.");
      return;
    }

    try {
      setIsSubmitting(true);
      const tx = await contract.confirmCollection(
        collectionForm.itemId.trim(),
        collectionForm.location.trim(),
        collectionForm.remarks.trim()
      );
      const receipt = await tx.wait();
      await refreshWalletState();
      await loadItems();

      setActionSuccess({
        title: "Collection Confirmed on Ledger",
        itemId: collectionForm.itemId,
        txHash: receipt.hash,
        newStatus: "Collected",
      });
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      console.error(err);
      setActionError(err.reason || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTransit = async (e) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess(null);

    const hasPermission = roles.isTransporter || roles.isAdmin || selectedPresetIndex === 2;
    if (!hasPermission) {
      setActionError("Access Denied: Your current account does not have TRANSPORTER_ROLE. Please switch to the Transporter account.");
      return;
    }

    try {
      setIsSubmitting(true);
      const tx = await contract.updateTransitStatus(
        transitForm.itemId.trim(),
        transitForm.location.trim(),
        transitForm.remarks.trim()
      );
      const receipt = await tx.wait();
      await refreshWalletState();
      await loadItems();

      setActionSuccess({
        title: "Transit Checkpoint Recorded",
        itemId: transitForm.itemId,
        txHash: receipt.hash,
        newStatus: "InTransit",
      });
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      console.error(err);
      setActionError(err.reason || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReceipt = async (e) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess(null);

    if (!roles.isRecycler && !roles.isAdmin) {
      setActionError("Access Denied: Your current account does not have RECYCLER_ROLE. Please switch to the Recycler account in the top-right menu.");
      return;
    }

    try {
      setIsSubmitting(true);
      const tx = await contract.confirmRecyclerReceipt(
        receiptForm.itemId.trim(),
        receiptForm.location.trim(),
        receiptForm.remarks.trim()
      );
      const receipt = await tx.wait();
      await refreshWalletState();
      await loadItems();

      setActionSuccess({
        title: "Recycler Receipt Confirmed",
        itemId: receiptForm.itemId,
        txHash: receipt.hash,
        newStatus: "ReceivedAtRecycler",
      });
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      console.error(err);
      setActionError(err.reason || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteRecycling = async (e) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess(null);

    if (!roles.isRecycler && !roles.isAdmin) {
      setActionError("Access Denied: Your current account does not have RECYCLER_ROLE. Please switch to the Recycler account in the top-right menu.");
      return;
    }

    try {
      setIsSubmitting(true);
      const tx = await contract.completeRecycling(
        completeForm.itemId.trim(),
        completeForm.certificateId.trim(),
        completeForm.facility.trim(),
        completeForm.recoveryMethod.trim(),
        BigInt(Math.round(Number(completeForm.recoveredWeightGrams))),
        completeForm.hazardousRef.trim(),
        completeForm.remarks.trim()
      );
      const receipt = await tx.wait();

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#22d3ee", "#fbbf24"],
        });
      } catch (e) {}

      await refreshWalletState();
      await loadItems();

      setActionSuccess({
        title: "Recycling Verified & Certificate Issued!",
        itemId: completeForm.itemId,
        certificateId: completeForm.certificateId,
        txHash: receipt.hash,
        newStatus: "RecyclingCompleted",
      });
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      console.error(err);
      setActionError(err.reason || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items by current eligible state
  const registeredItems = allItems.filter((i) => i.statusCode === 0);
  const transitEligibleItems = allItems.filter((i) => i.statusCode === 1 || i.statusCode === 2);
  const inTransitItems = allItems.filter((i) => i.statusCode === 2);
  const receivedItems = allItems.filter((i) => i.statusCode === 3);

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 0 3rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Role-Protected Lifecycle Actions</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Execute state-machine transitions on the blockchain. Every action is secured by Solidity Role-Based Access Control (RBAC). Non-authorized wallets are rejected by smart contract assertions.
        </p>
      </div>

      {/* Role Navigation Pills */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => { setActiveSubTab("collection"); setActionSuccess(null); setActionError(""); }}
          className={`btn ${activeSubTab === "collection" ? "btn-primary" : "btn-secondary"}`}
          style={{ gap: "0.5rem" }}
        >
          <PackageCheck size={17} />
          <span>1. Collection Centre</span>
        </button>

        <button
          onClick={() => { setActiveSubTab("transit"); setActionSuccess(null); setActionError(""); }}
          className={`btn ${activeSubTab === "transit" ? "btn-primary" : "btn-secondary"}`}
          style={{ gap: "0.5rem" }}
        >
          <Truck size={17} />
          <span>2. Transporter</span>
        </button>

        <button
          onClick={() => { setActiveSubTab("recycler"); setActionSuccess(null); setActionError(""); }}
          className={`btn ${activeSubTab === "recycler" ? "btn-primary" : "btn-secondary"}`}
          style={{ gap: "0.5rem" }}
        >
          <Recycle size={17} />
          <span>3. Recycler Processing</span>
        </button>
      </div>

      {/* Action Card Container */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        {/* Collection Centre Portal */}
        {activeSubTab === "collection" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.35rem" }}>Confirm Physical E-Waste Collection</h2>
                <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Intake registered items into an authorized collection depot. Transitions status: <span className="badge badge-registered">Registered</span> → <span className="badge badge-collected">Collected</span>.
                </p>
              </div>
              <span className="badge" style={{ background: "rgba(251, 191, 36, 0.15)", color: "#fde68a", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                COLLECTION_CENTRE_ROLE Required
              </span>
            </div>

            {!roles.isCollectionCentre && !roles.isAdmin && selectedPresetIndex !== 1 && (
              <div style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)", color: "#fef08a", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <Info size={18} />
                  <span>Notice: Active account is not Collection Centre.</span>
                </div>
                <button
                  type="button"
                  onClick={() => selectPresetAccount(1)}
                  className="btn btn-outline-emerald"
                  style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
                >
                  Switch to Collection Centre Account (1-Click)
                </button>
              </div>
            )}

            <form onSubmit={handleConfirmCollection}>
              <div className="form-group">
                <label className="form-label">Select Registered E-Waste Item</label>
                {registeredItems.length > 0 ? (
                  <select
                    className="form-select"
                    value={collectionForm.itemId}
                    onChange={(e) => setCollectionForm((p) => ({ ...p, itemId: e.target.value }))}
                    required
                  >
                    {registeredItems.map((item) => (
                      <option key={item.itemId} value={item.itemId}>
                        {item.itemId} — {item.brandModel} ({item.itemType})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter E-Waste ID (e.g. EW-DEMO-001)"
                    value={collectionForm.itemId}
                    onChange={(e) => setCollectionForm((p) => ({ ...p, itemId: e.target.value }))}
                    required
                  />
                )}
                <span className="form-hint">Item must currently be in 'Registered' state on-chain.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Collection Hub Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={collectionForm.location}
                  onChange={(e) => setCollectionForm((p) => ({ ...p, location: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Depot Intake Remarks</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={collectionForm.remarks}
                  onChange={(e) => setCollectionForm((p) => ({ ...p, remarks: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
                {isSubmitting ? <Loader2 size={16} className="pulse-live" /> : <PackageCheck size={16} />}
                <span>Confirm Collection On-Chain</span>
              </button>
            </form>
          </div>
        )}

        {/* Transporter Portal */}
        {activeSubTab === "transit" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.35rem" }}>Logistics & Transit Updates</h2>
                <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Record transit dispatch and route checkpoints. Transitions: <span className="badge badge-collected">Collected</span> → <span className="badge badge-intransit">InTransit</span>.
                </p>
              </div>
              <span className="badge" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#a5f3fc", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
                TRANSPORTER_ROLE Required
              </span>
            </div>

            {!roles.isTransporter && !roles.isAdmin && selectedPresetIndex !== 2 && (
              <div style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.3)", color: "#bae6fd", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <Info size={18} />
                  <span>Notice: Active account is not Transporter.</span>
                </div>
                <button
                  type="button"
                  onClick={() => selectPresetAccount(2)}
                  className="btn btn-outline-emerald"
                  style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
                >
                  Switch to Transporter (EcoLogistics) Account (1-Click)
                </button>
              </div>
            )}

            <form onSubmit={handleUpdateTransit}>
              <div className="form-group">
                <label className="form-label">Select Collected / In-Transit Item</label>
                {transitEligibleItems.length > 0 ? (
                  <select
                    className="form-select"
                    value={transitForm.itemId}
                    onChange={(e) => setTransitForm((p) => ({ ...p, itemId: e.target.value }))}
                    required
                  >
                    {transitEligibleItems.map((item) => (
                      <option key={item.itemId} value={item.itemId}>
                        {item.itemId} — {item.brandModel} ({item.statusText})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter E-Waste ID"
                    value={transitForm.itemId}
                    onChange={(e) => setTransitForm((p) => ({ ...p, itemId: e.target.value }))}
                    required
                  />
                )}
                <span className="form-hint">Item must currently be 'Collected' or already 'InTransit' (checkpoints).</span>
              </div>

              <div className="form-group">
                <label className="form-label">Transit Checkpoint / Logistics Route</label>
                <input
                  type="text"
                  className="form-input"
                  value={transitForm.location}
                  onChange={(e) => setTransitForm((p) => ({ ...p, location: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Logistics Custody Remarks</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={transitForm.remarks}
                  onChange={(e) => setTransitForm((p) => ({ ...p, remarks: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
                {isSubmitting ? <Loader2 size={16} className="pulse-live" /> : <Truck size={16} />}
                <span>Record Transit Checkpoint</span>
              </button>
            </form>
          </div>
        )}

        {/* Recycler Processing Portal */}
        {activeSubTab === "recycler" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.35rem" }}>Recycler Facility Portal</h2>
                <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Confirm facility dock intake, perform certified material recovery, and issue cryptographic certificates.
                </p>
              </div>
              <span className="badge" style={{ background: "rgba(167, 139, 250, 0.15)", color: "#ddd6fe", border: "1px solid rgba(167, 139, 250, 0.3)" }}>
                RECYCLER_ROLE Required
              </span>
            </div>

            {!roles.isRecycler && !roles.isAdmin && selectedPresetIndex !== 3 && (
              <div style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: "rgba(167, 139, 250, 0.1)", border: "1px solid rgba(167, 139, 250, 0.3)", color: "#e9d5ff", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <Info size={18} />
                  <span>Notice: Active account is not Recycler.</span>
                </div>
                <button
                  type="button"
                  onClick={() => selectPresetAccount(3)}
                  className="btn btn-outline-emerald"
                  style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
                >
                  Switch to Recycler (CleanTech Plant) Account (1-Click)
                </button>
              </div>
            )}

            {/* Sub-section 1: Confirm Plant Receipt */}
            <div style={{ background: "rgba(13, 21, 34, 0.6)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", marginBottom: "1.75rem" }}>
              <h3 style={{ fontSize: "1.05rem", marginBottom: "0.75rem", color: "var(--cyan-400)" }}>
                Step A: Confirm Physical Receipt at Plant
              </h3>
              <form onSubmit={handleConfirmReceipt}>
                <div className="form-group">
                  <label className="form-label">Select In-Transit Item</label>
                  {inTransitItems.length > 0 ? (
                    <select
                      className="form-select"
                      value={receiptForm.itemId}
                      onChange={(e) => setReceiptForm((p) => ({ ...p, itemId: e.target.value }))}
                      required
                    >
                      {inTransitItems.map((item) => (
                        <option key={item.itemId} value={item.itemId}>
                          {item.itemId} — {item.brandModel}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter In-Transit Item ID (e.g. EW-DEMO-002)"
                      value={receiptForm.itemId}
                      onChange={(e) => setReceiptForm((p) => ({ ...p, itemId: e.target.value }))}
                      required
                    />
                  )}
                  <span className="form-hint">Item must currently be 'InTransit'. Transitions to 'ReceivedAtRecycler'.</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Plant Dock / Inspection Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={receiptForm.location}
                      onChange={(e) => setReceiptForm((p) => ({ ...p, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Receipt Inspection Remarks</label>
                    <input
                      type="text"
                      className="form-input"
                      value={receiptForm.remarks}
                      onChange={(e) => setReceiptForm((p) => ({ ...p, remarks: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn btn-secondary">
                  <CheckCircle2 size={16} />
                  <span>Confirm Dock Receipt</span>
                </button>
              </form>
            </div>

            {/* Sub-section 2: Complete Recycling and Issue Certificate */}
            <div style={{ background: "rgba(16, 185, 129, 0.06)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-emerald)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Sparkles size={18} color="var(--emerald-400)" />
                <h3 style={{ fontSize: "1.05rem", color: "var(--emerald-400)" }}>
                  Step B: Complete Recycling & Issue Verifiable Certificate
                </h3>
              </div>

              <form onSubmit={handleCompleteRecycling}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Select Received Item</label>
                    {receivedItems.length > 0 ? (
                      <select
                        className="form-select"
                        value={completeForm.itemId}
                        onChange={(e) => setCompleteForm((p) => ({ ...p, itemId: e.target.value }))}
                        required
                      >
                        {receivedItems.map((item) => (
                          <option key={item.itemId} value={item.itemId}>
                            {item.itemId} — {item.brandModel}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter Received Item ID"
                        value={completeForm.itemId}
                        onChange={(e) => setCompleteForm((p) => ({ ...p, itemId: e.target.value }))}
                        required
                      />
                    )}
                    <span className="form-hint">Item must currently be 'ReceivedAtRecycler'.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Certificate Serial ID</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--cyan-400)" }}
                      value={completeForm.certificateId}
                      onChange={(e) => setCompleteForm((p) => ({ ...p, certificateId: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Recycling Plant Facility</label>
                    <input
                      type="text"
                      className="form-input"
                      value={completeForm.facility}
                      onChange={(e) => setCompleteForm((p) => ({ ...p, facility: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Recovery Method</label>
                    <input
                      type="text"
                      className="form-input"
                      value={completeForm.recoveryMethod}
                      onChange={(e) => setCompleteForm((p) => ({ ...p, recoveryMethod: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Recovered Secondary Materials (Grams)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={completeForm.recoveredMaterialsWeightGrams}
                      onChange={(e) => setCompleteForm((p) => ({ ...p, recoveredMaterialsWeightGrams: e.target.value }))}
                      required
                    />
                    <span className="form-hint">{(Number(completeForm.recoveredMaterialsWeightGrams) / 1000).toFixed(2)} kg recovered</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hazardous Waste Disposal Reference</label>
                    <input
                      type="text"
                      className="form-input"
                      value={completeForm.hazardousRef}
                      onChange={(e) => setCompleteForm((p) => ({ ...p, hazardousRef: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Certification Notes & Material Purity Summary</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={completeForm.remarks}
                    onChange={(e) => setCompleteForm((p) => ({ ...p, remarks: e.target.value }))}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="pulse-live" />
                      <span>Verifying On-Chain Destruction & Issuing Certificate...</span>
                    </>
                  ) : (
                    <>
                      <Recycle size={18} />
                      <span>Complete Recycling & Issue Certificate</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Global Feedback Notifications */}
        {actionError && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "10px", background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)", color: "#fda4af", fontSize: "0.86rem", display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <AlertCircle size={20} />
            <div>
              <strong>Transaction Reverted / Blocked:</strong> {actionError}
            </div>
          </div>
        )}

        {actionSuccess && (
          <div className="glass-panel animate-slide-down" style={{ marginTop: "1.5rem", padding: "1.25rem", border: "1px solid var(--border-emerald)", background: "rgba(16, 185, 129, 0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--emerald-400)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.4rem" }}>
              <CheckCircle2 size={20} />
              <span>{actionSuccess.title}</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              Item <strong>{actionSuccess.itemId}</strong> is now officially registered in state <strong>'{actionSuccess.newStatus}'</strong> on the blockchain.
            </div>
            <div style={{ fontSize: "0.76rem", fontFamily: "var(--font-mono)", color: "var(--cyan-400)", wordBreak: "break-all" }}>
              Tx: {actionSuccess.txHash}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
