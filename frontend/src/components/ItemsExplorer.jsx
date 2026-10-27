import React, { useState, useEffect } from "react";
import { fetchAllItems } from "../services/api";
import {
  Layers,
  Search,
  Filter,
  Eye,
  FileCheck2,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function ItemsExplorer({ onSelectTrackItem, onViewCertificate }) {
  const [items, setItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await fetchAllItems();
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const shortenAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const filteredItems = items.filter((item) => {
    const matchesStatus = filterStatus === "ALL" || item.statusText === filterStatus;
    const matchesSearch =
      item.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brandModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "1.5rem 0 3rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>E-Waste Ledger Explorer</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Comprehensive public audit registry of all electronic equipment registered across the decentralized network.
          </p>
        </div>

        <button onClick={loadItems} disabled={loading} className="btn btn-secondary" style={{ gap: "0.45rem" }}>
          <RefreshCw size={15} className={loading ? "pulse-live" : ""} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <input
            type="text"
            className="form-input"
            style={{ width: "100%", paddingLeft: "2.3rem" }}
            placeholder="Search by ID, model, category, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Filter size={14} /> Filter:
          </span>
          {["ALL", "Registered", "Collected", "InTransit", "ReceivedAtRecycler", "RecyclingCompleted"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 500,
                background: filterStatus === st ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.04)",
                color: filterStatus === st ? "var(--emerald-400)" : "var(--text-secondary)",
                border: filterStatus === st ? "1px solid var(--border-emerald)" : "1px solid var(--border-subtle)",
                cursor: "pointer",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Explorer Table */}
      <div className="glass-panel" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "rgba(13, 21, 34, 0.9)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "1rem 1.25rem" }}>E-Waste ID</th>
                <th style={{ padding: "1rem 1.25rem" }}>Device Model & Type</th>
                <th style={{ padding: "1rem 1.25rem" }}>Weight</th>
                <th style={{ padding: "1rem 1.25rem" }}>Registered By</th>
                <th style={{ padding: "1rem 1.25rem" }}>Lifecycle Status</th>
                <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    No matching items found on the distributed ledger.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.itemId}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16, 185, 129, 0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--cyan-400)" }}>
                        {item.itemId}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-highlight)" }}>{item.brandModel}</div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                        {item.itemType} • SN: {item.serialNumber}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ fontWeight: 600 }}>{item.weightKg} kg</span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        {shortenAddress(item.registeredBy)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      {getStatusBadge(item.statusText)}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => onSelectTrackItem(item.itemId)}
                          className="btn btn-secondary"
                          style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                          title="Track Lifecycle History"
                        >
                          <Eye size={14} />
                          <span>Track</span>
                        </button>

                        {item.statusCode === 4 && (
                          <button
                            onClick={() => onViewCertificate(item)}
                            className="btn btn-outline-emerald"
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                            title="View Recycling Certificate"
                          >
                            <FileCheck2 size={14} />
                            <span>Cert</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
