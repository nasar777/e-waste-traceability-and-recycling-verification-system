import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useWallet } from "../context/WalletContext";
import { saveItemMetadata } from "../services/api";
import { PlusCircle, QrCode, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterItem({ onRegisteredSuccess }) {
  const { contract, account, refreshWalletState } = useWallet();

  const generateUniqueId = () => {
    const randomHex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, "0");
    return `EW-2026-${randomHex}`;
  };

  const [formData, setFormData] = useState({
    itemId: generateUniqueId(),
    itemType: "Smartphone",
    brandModel: "Samsung Galaxy S22 Ultra",
    weightGrams: "228",
    serialNumber: `SN-${Math.floor(10000000 + Math.random() * 90000000)}`,
    location: "GreenTech Civic Collection Point #4",
    remarks: "Cracked display glass; non-functional power IC",
    hazardousMaterials: ["Lithium-ion Battery"],
  });

  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHazardToggle = (material) => {
    setFormData((prev) => {
      const current = prev.hazardousMaterials;
      const exists = current.includes(material);
      return {
        ...prev,
        hazardousMaterials: exists
          ? current.filter((m) => m !== material)
          : [...current, material],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setTxResult(null);

    if (!contract) {
      setErrorMessage("Smart contract is not ready. Please verify connection.");
      return;
    }

    if (!formData.itemId.trim()) {
      setErrorMessage("E-Waste ID cannot be empty.");
      return;
    }

    if (!formData.weightGrams || Number(formData.weightGrams) <= 0) {
      setErrorMessage("Please enter a valid weight in grams.");
      return;
    }

    try {
      setTxSubmitting(true);

      // Execute on-chain transaction
      const tx = await contract.registerItem(
        formData.itemId.trim(),
        formData.itemType.trim(),
        formData.brandModel.trim(),
        BigInt(Math.round(Number(formData.weightGrams))),
        formData.serialNumber.trim(),
        formData.location.trim(),
        formData.remarks.trim()
      );

      const receipt = await tx.wait();

      // Cache metadata in MongoDB
      try {
        await saveItemMetadata({
          itemId: formData.itemId.trim(),
          category: formData.itemType,
          hazardousMaterials: formData.hazardousMaterials,
          notes: formData.remarks,
        });
      } catch (cacheErr) {
        console.warn("MongoDB caching note:", cacheErr.message);
      }

      await refreshWalletState();

      setTxResult({
        success: true,
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        itemId: formData.itemId,
      });

      if (onRegisteredSuccess) {
        onRegisteredSuccess(formData.itemId);
      }
    } catch (err) {
      console.error("Registration error:", err);
      // Extract human-friendly revert reason if possible
      let msg = err.reason || err.message;
      if (err.data && err.data.message) msg = err.data.message;
      setErrorMessage(msg);
    } finally {
      setTxSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 0 3rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Register Electronic Waste</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Record a new electronic waste item directly onto the blockchain ledger. This establishes the immutable origin block and generates its permanent traceability QR passport.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem" }}>
        {/* Registration Form */}
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <form onSubmit={handleSubmit}>
            {/* Item ID Field with Auto-generator */}
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Unique E-Waste ID (Unique On-Chain)</span>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, itemId: generateUniqueId() }))}
                  style={{ background: "none", border: "none", color: "var(--emerald-400)", fontSize: "0.76rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                  <Sparkles size={12} />
                  <span>Generate Random</span>
                </button>
              </label>
              <input
                type="text"
                name="itemId"
                value={formData.itemId}
                onChange={handleInputChange}
                required
                className="form-input"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--cyan-400)" }}
              />
              <span className="form-hint">Must be globally unique. Reverts if an existing ID is used.</span>
            </div>

            {/* Item Type & Model */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Classification / Type</label>
                <select name="itemType" value={formData.itemType} onChange={handleInputChange} className="form-select">
                  <option value="Smartphone">Smartphone</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop Computer">Desktop Computer</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Television & Display">Television & Display</option>
                  <option value="Household Appliance">Household Appliance</option>
                  <option value="Battery & Power Supply">Battery & Power Supply</option>
                  <option value="Printed Circuit Board (PCB)">Printed Circuit Board (PCB)</option>
                  <option value="Other Electronic Component">Other Component</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Brand & Model</label>
                <input
                  type="text"
                  name="brandModel"
                  value={formData.brandModel}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Dell Latitude 5420"
                  className="form-input"
                />
              </div>
            </div>

            {/* Weight and Serial Number */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Weight (Grams)</label>
                <input
                  type="number"
                  name="weightGrams"
                  value={formData.weightGrams}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="e.g. 210"
                  className="form-input"
                />
                <span className="form-hint">{(Number(formData.weightGrams) / 1000).toFixed(2)} kg equivalent</span>
              </div>

              <div className="form-group">
                <label className="form-label">Manufacturer Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. SN-49821-X"
                  className="form-input"
                />
              </div>
            </div>

            {/* Origin Location */}
            <div className="form-group">
              <label className="form-label">Origin Location / Drop-off Point</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g. Metropolitan Recycling Depot, Zone 7"
                className="form-input"
              />
            </div>

            {/* Hazardous Constituents */}
            <div className="form-group">
              <label className="form-label">Known Hazardous Materials</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
                {["Lithium-ion Battery", "Lead Solder", "Mercury Lamp", "Cadmium", "Flame Retardants"].map((mat) => {
                  const checked = formData.hazardousMaterials.includes(mat);
                  return (
                    <button
                      type="button"
                      key={mat}
                      onClick={() => handleHazardToggle(mat)}
                      style={{
                        padding: "0.3rem 0.65rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        background: checked ? "rgba(244, 63, 94, 0.18)" : "rgba(255, 255, 255, 0.04)",
                        color: checked ? "#fda4af" : "var(--text-muted)",
                        border: checked ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)",
                        cursor: "pointer",
                      }}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            <div className="form-group">
              <label className="form-label">Initial Condition & Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={2}
                placeholder="Physical damages, missing parts, battery health..."
                className="form-textarea"
              />
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)", color: "#fda4af", fontSize: "0.85rem", display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={txSubmitting}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
            >
              {txSubmitting ? (
                <>
                  <Loader2 size={18} className="pulse-live" />
                  <span>Committing Transaction to Blockchain...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  <span>Register Item On-Chain</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* QR Code & Passport Preview Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="glass-panel" style={{ padding: "1.75rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--emerald-400)", fontWeight: 600, marginBottom: "0.5rem" }}>
              Dynamic E-Waste Passport QR
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Scan to trace on-chain lifecycle history
            </div>

            <div style={{
              padding: "1rem",
              background: "#ffffff",
              borderRadius: "14px",
              display: "inline-block",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              border: "4px solid rgba(16, 185, 129, 0.3)",
            }}>
              <QRCodeSVG
                value={JSON.stringify({
                  app: "EcoChain",
                  id: formData.itemId,
                  origin: formData.location,
                  type: formData.itemType,
                })}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            <div style={{ marginTop: "1.25rem", width: "100%", textAlign: "left", background: "rgba(10, 16, 26, 0.7)", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Target ID</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--cyan-400)", fontWeight: 700, margin: "2px 0 8px" }}>
                {formData.itemId}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                <span>Sender Signer:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-highlight)" }}>{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Not connected"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                <span>Initial State:</span>
                <span className="badge badge-registered">Registered</span>
              </div>
            </div>
          </div>

          {/* Success Notification Box */}
          {txResult && (
            <div className="glass-panel animate-slide-down" style={{ padding: "1.25rem", border: "1px solid var(--border-emerald)", background: "rgba(16, 185, 129, 0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--emerald-400)", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.4rem" }}>
                <CheckCircle2 size={18} />
                <span>On-Chain Registration Confirmed!</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Item <strong>{txResult.itemId}</strong> has been sealed into Block #{txResult.blockNumber}.
              </div>
              <div style={{ fontSize: "0.74rem", fontFamily: "var(--font-mono)", color: "var(--cyan-400)", wordBreak: "break-all" }}>
                Tx: {txResult.hash}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
