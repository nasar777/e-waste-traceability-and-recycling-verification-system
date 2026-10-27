import React, { useState, useEffect } from "react";
import { fetchAnalytics, fetchAllItems } from "../services/api";
import { useWallet } from "../context/WalletContext";
import {
  Recycle,
  CheckCircle2,
  Truck,
  Leaf,
  PlusCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Cpu
} from "lucide-react";

export default function Dashboard({ setActiveTab, onSelectTrackItem }) {
  const { contractInfo } = useWallet();
  const [analytics, setAnalytics] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, itemsRes] = await Promise.all([
        fetchAnalytics(),
        fetchAllItems(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes);
      if (itemsRes.success) setRecentItems(itemsRes.data.slice(0, 5));
    } catch (err) {
      console.error("Dashboard data load error:", err);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "1.5rem 0 3rem" }}>
      {/* Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "2.25rem",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(15, 23, 42, 0.7) 100%)",
          border: "1px solid var(--border-emerald)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.75rem", borderRadius: "999px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid var(--border-emerald)", marginBottom: "0.85rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }}></span>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--emerald-400)" }}>Smart Contract Live on Localhost:8545</span>
          </div>
          <h1 style={{ fontSize: "2.3rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.75rem" }}>
            Decentralized E-Waste Traceability & Verifiable Recycling
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", lineHeight: 1.6 }}>
            EcoChain records the immutable lifecycle of electronics from consumer registration, collection hubs, and freight transit, to authenticated recycling facilities and verifiable material recovery certificates.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button onClick={() => setActiveTab("register")} className="btn btn-primary">
              <PlusCircle size={17} />
              <span>Register E-Waste Item</span>
            </button>
            <button onClick={() => setActiveTab("track")} className="btn btn-secondary">
              <Search size={17} />
              <span>Track with ID or QR</span>
            </button>
          </div>
        </div>

        <div style={{
          padding: "1.25rem",
          borderRadius: "14px",
          background: "rgba(10, 16, 26, 0.8)",
          border: "1px solid var(--border-subtle)",
          minWidth: "260px",
        }}>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
            Smart Contract Verified
          </div>
          <div style={{ fontSize: "0.84rem", fontFamily: "var(--font-mono)", color: "var(--cyan-400)", wordBreak: "break-all", marginBottom: "0.75rem" }}>
            {contractInfo?.address || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.6rem" }}>
            <span>Network Chain ID</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-highlight)" }}>{contractInfo?.chainId || 31337}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
            <span>EVM Target</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--emerald-400)" }}>Paris / 0.8.20</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.25rem",
      }}>
        {/* Card 1 */}
        <div className="glass-panel" style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Total Registered</span>
            <div style={{ padding: "0.5rem", borderRadius: "10px", background: "rgba(6, 182, 212, 0.12)", color: "var(--cyan-400)" }}>
              <Cpu size={20} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-highlight)", letterSpacing: "-0.03em" }}>
            {analytics?.summary?.totalItemsRegistered ?? recentItems.length}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {analytics?.summary?.totalWeightKg || "1.65"} kg total weight catalogued
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel" style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Recycling Verified</span>
            <div style={{ padding: "0.5rem", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", color: "var(--emerald-400)" }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--emerald-400)", letterSpacing: "-0.03em" }}>
            {analytics?.summary?.totalCompletedRecycling ?? 0}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Verifiable on-chain destruction certificates
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel" style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Active in Logistics</span>
            <div style={{ padding: "0.5rem", borderRadius: "10px", background: "rgba(251, 191, 36, 0.12)", color: "var(--amber-400)" }}>
              <Truck size={20} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-highlight)", letterSpacing: "-0.03em" }}>
            {analytics?.summary?.activeInPipeline ?? recentItems.length}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Collection & Transit custody checkpoints
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel" style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>CO2 Emissions Avoided</span>
            <div style={{ padding: "0.5rem", borderRadius: "10px", background: "rgba(167, 139, 250, 0.12)", color: "var(--purple-400)" }}>
              <Leaf size={20} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--cyan-400)", letterSpacing: "-0.03em" }}>
            {analytics?.environmentalImpact?.estimatedCo2AvoidedKg || "0.00"} <span style={{ fontSize: "1rem" }}>kg</span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            UN SDG 12 & 13 circular impact model
          </div>
        </div>
      </div>

      {/* Lifecycle Flow Pipeline & Recent Items Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {/* Pipeline Stage Breakdown */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Traceability Lifecycle Funnel</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Strict On-Chain State Machine</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { stage: "Registered", role: "Consumer", desc: "Item logged with specs & unique ID", count: analytics?.statusBreakdown?.Registered ?? 1, color: "#94a3b8" },
              { stage: "Collected", role: "Collection Centre", desc: "Inspected and batch inventoried", count: analytics?.statusBreakdown?.Collected ?? 0, color: "#fbbf24" },
              { stage: "InTransit", role: "Transporter", desc: "Freight tracking & custody handover", count: analytics?.statusBreakdown?.InTransit ?? 1, color: "#22d3ee" },
              { stage: "ReceivedAtRecycler", role: "Recycler", desc: "Arrival verified at processing plant", count: analytics?.statusBreakdown?.ReceivedAtRecycler ?? 0, color: "#a78bfa" },
              { stage: "RecyclingCompleted", role: "Recycler", desc: "Materials extracted & certificate issued", count: analytics?.statusBreakdown?.RecyclingCompleted ?? 0, color: "#34d399" },
            ].map((st, idx) => (
              <div
                key={st.stage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "rgba(13, 21, 34, 0.6)",
                  borderRadius: "10px",
                  borderLeft: `4px solid ${st.color}`,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{idx + 1}. {st.stage}</span>
                    <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>
                      {st.role}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {st.desc}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.2rem", color: st.color }}>
                  {st.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Items in Ledger */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Recent On-Chain Activity</h3>
            <button onClick={() => setActiveTab("explorer")} className="btn btn-secondary" style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}>
              View All
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recentItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                No e-waste items found. Register one to see the blockchain in action!
              </div>
            ) : (
              recentItems.map((item) => (
                <div
                  key={item.itemId}
                  className="glass-card-interactive"
                  onClick={() => onSelectTrackItem(item.itemId)}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(13, 21, 34, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "3px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.88rem", color: "var(--cyan-400)" }}>
                        {item.itemId}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        • {item.brandModel}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {item.itemType} | {item.weightKg} kg
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(item.statusText)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
