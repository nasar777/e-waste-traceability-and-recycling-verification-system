import React, { useState, useEffect } from "react";
import { fetchItemById, fetchAllItems } from "../services/api";
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Package,
  Cpu,
  Layers
} from "lucide-react";

export default function TrackItem({ initialItemId, onViewCertificate }) {
  const [searchId, setSearchId] = useState(initialItemId || "");
  const [itemData, setItemData] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadAvailableList();
    if (initialItemId) {
      handleSearch(initialItemId);
    }
  }, [initialItemId]);

  const loadAvailableList = async () => {
    try {
      const res = await fetchAllItems();
      if (res.success) setAvailableItems(res.data);
    } catch (e) {
      console.warn("Could not load available items:", e);
    }
  };

  const handleSearch = async (idToSearch) => {
    const id = (idToSearch || searchId).trim();
    if (!id) return;

    setLoading(true);
    setNotFound(false);
    setItemData(null);

    try {
      const res = await fetchItemById(id);
      if (res.success && res.data) {
        setItemData(res.data);
      } else {
        setNotFound(true);
      }
    } catch (e) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getStatusBadge = (status) => {
    const cls = `badge badge-${status.toLowerCase()}`;
    return (
      <span className={cls}>
        <span className="badge-dot" />
        {status}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem 0 3rem" }}>
      {/* Header & Search Bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Track & Trace E-Waste Lifecycle</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Query the distributed ledger to verify the chronological chain of custody and physical processing events for any registered electronic item.
        </p>

        {/* Search Input Box */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", maxWidth: "600px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter E-Waste ID (e.g. EW-DEMO-001)"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="form-input"
              style={{
                width: "100%",
                paddingLeft: "2.4rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.95rem",
              }}
            />
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)" }}
            />
          </div>
          <button onClick={() => handleSearch()} className="btn btn-primary">
            <span>Verify on Ledger</span>
          </button>
        </div>

        {/* Quick Selection Chips */}
        {availableItems.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>Recent On-Chain Items:</span>
            {availableItems.slice(0, 5).map((it) => (
              <button
                key={it.itemId}
                onClick={() => {
                  setSearchId(it.itemId);
                  handleSearch(it.itemId);
                }}
                style={{
                  background: searchId === it.itemId ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.04)",
                  border: searchId === it.itemId ? "1px solid var(--emerald-400)" : "1px solid var(--border-subtle)",
                  color: searchId === it.itemId ? "var(--emerald-400)" : "var(--text-secondary)",
                  borderRadius: "6px",
                  padding: "0.2rem 0.55rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {it.itemId}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <div className="pulse-live" style={{ fontSize: "1.1rem" }}>Querying Ethereum node for block history...</div>
        </div>
      )}

      {/* Not Found */}
      {notFound && !loading && (
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", border: "1px solid rgba(244, 63, 94, 0.3)" }}>
          <AlertTriangle size={32} color="#fb7185" style={{ marginBottom: "0.5rem" }} />
          <h3 style={{ fontSize: "1.2rem", color: "#fda4af", marginBottom: "0.4rem" }}>Item Not Found on Blockchain</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            The item ID <strong>"{searchId}"</strong> was not located in contract storage. Please verify the ID or register it first.
          </p>
        </div>
      )}

      {/* Found Item Details & Stepper */}
      {itemData && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* Item Passport Card */}
          <div className="glass-panel" style={{ padding: "1.75rem", border: "1px solid var(--border-emerald)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--cyan-400)" }}>
                    {itemData.itemId}
                  </span>
                  {getStatusBadge(itemData.statusText)}
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-highlight)" }}>
                  {itemData.brandModel}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Category: {itemData.itemType} • Serial: {itemData.serialNumber}
                </div>
              </div>

              {/* Action Buttons if Certificate exists */}
              {itemData.certificate && (
                <button
                  onClick={() => onViewCertificate(itemData)}
                  className="btn btn-outline-emerald"
                  style={{ gap: "0.5rem", boxShadow: "0 0 15px rgba(16, 185, 129, 0.25)" }}
                >
                  <FileCheck2 size={18} />
                  <span>View Official Recycling Certificate</span>
                </button>
              )}
            </div>

            {/* Quick Specs Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1rem",
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-subtle)",
            }}>
              <div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Weight</div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{itemData.weightKg} kg ({itemData.weightGrams}g)</div>
              </div>
              <div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Initial Origin Address</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                  {shortenAddress(itemData.registeredBy)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Registration Timestamp</div>
                <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                  {new Date(itemData.registrationDate).toLocaleDateString()} {new Date(itemData.registrationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Blockchain Custody</div>
                <div style={{ fontSize: "0.84rem", color: "var(--emerald-400)", fontWeight: 500 }}>
                  {itemData.history?.length || 1} Blocks Verified
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Lifecycle Audit Stepper */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={19} color="var(--emerald-400)" />
              <span>Immutable Chain-of-Custody Timeline</span>
            </h3>

            <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
              {/* Stepper Vertical Line */}
              <div style={{
                position: "absolute",
                top: "10px",
                bottom: "10px",
                left: "28px",
                width: "2px",
                background: "linear-gradient(to bottom, #10b981 0%, #06b6d4 50%, #a78bfa 100%)",
              }} />

              {/* History Event Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                {itemData.history?.map((step, idx) => (
                  <div key={idx} style={{ position: "relative", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    {/* Circle Node */}
                    <div style={{
                      position: "relative",
                      zIndex: 2,
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "#0d1522",
                      border: "2px solid #10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10b981",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)",
                    }}>
                      {step.step}
                    </div>

                    {/* Step Card Content */}
                    <div style={{
                      flex: 1,
                      padding: "1rem 1.25rem",
                      borderRadius: "12px",
                      background: "rgba(13, 21, 34, 0.7)",
                      border: "1px solid var(--border-subtle)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-highlight)" }}>
                            {step.statusText}
                          </span>
                          <span style={{ fontSize: "0.74rem", padding: "0.15rem 0.45rem", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "var(--cyan-400)", border: "1px solid rgba(255,255,255,0.1)" }}>
                            Role: {step.updaterRole}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {new Date(step.date).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                        <MapPin size={14} color="var(--amber-400)" />
                        <span>Location: <strong>{step.location || "Unspecified Point"}</strong></span>
                      </div>

                      <div style={{ fontSize: "0.84rem", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                        "{step.remarks || "No remarks provided"}"
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.74rem", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.45rem" }}>
                        <User size={13} />
                        <span>Signed by:</span>
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          {step.updatedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
