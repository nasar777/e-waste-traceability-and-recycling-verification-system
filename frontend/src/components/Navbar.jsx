import React, { useState } from "react";
import { useWallet, PRECONFIGURED_ACCOUNTS } from "../context/WalletContext";
import {
  Shield,
  Layers,
  Search,
  PlusCircle,
  Truck,
  RotateCcw,
  CheckCircle,
  ChevronDown,
  Wallet,
  Activity,
  FileText
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const { account, roles, selectedPresetIndex, selectPresetAccount, connectMetaMask, isMetaMask, balance } = useWallet();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const shortenAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getPrimaryRoleTitle = () => {
    if (!isMetaMask && PRECONFIGURED_ACCOUNTS[selectedPresetIndex]) {
      return PRECONFIGURED_ACCOUNTS[selectedPresetIndex].roleName;
    }
    if (roles.isAdmin) return "Administrator";
    if (roles.isCollectionCentre) return "Collection Centre";
    if (roles.isTransporter) return "Transporter";
    if (roles.isRecycler) return "Recycler";
    return "Consumer";
  };

  return (
    <header className="no-print" style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(8, 13, 20, 0.85)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "72px",
      }}>
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab("dashboard")}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
        >
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(16, 185, 129, 0.4)",
          }}>
            <RotateCcw size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span>EcoChain</span>
              <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem", background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald-400)", borderRadius: "6px", border: "1px solid var(--border-emerald)" }}>BCT</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>E-Waste Traceability & Verification</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.55rem 0.95rem",
              background: activeTab === "dashboard" ? "rgba(16, 185, 129, 0.12)" : "transparent",
              color: activeTab === "dashboard" ? "var(--emerald-400)" : "var(--text-secondary)",
              border: activeTab === "dashboard" ? "1px solid var(--border-emerald)" : "1px solid transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.88rem",
              transition: "all 0.2s ease",
            }}
          >
            <Activity size={16} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("register")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.55rem 0.95rem",
              background: activeTab === "register" ? "rgba(16, 185, 129, 0.12)" : "transparent",
              color: activeTab === "register" ? "var(--emerald-400)" : "var(--text-secondary)",
              border: activeTab === "register" ? "1px solid var(--border-emerald)" : "1px solid transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.88rem",
              transition: "all 0.2s ease",
            }}
          >
            <PlusCircle size={16} />
            <span>Register E-Waste</span>
          </button>

          <button
            onClick={() => setActiveTab("track")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.55rem 0.95rem",
              background: activeTab === "track" ? "rgba(16, 185, 129, 0.12)" : "transparent",
              color: activeTab === "track" ? "var(--emerald-400)" : "var(--text-secondary)",
              border: activeTab === "track" ? "1px solid var(--border-emerald)" : "1px solid transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.88rem",
              transition: "all 0.2s ease",
            }}
          >
            <Search size={16} />
            <span>Track & Trace</span>
          </button>

          <button
            onClick={() => setActiveTab("lifecycle")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.55rem 0.95rem",
              background: activeTab === "lifecycle" ? "rgba(16, 185, 129, 0.12)" : "transparent",
              color: activeTab === "lifecycle" ? "var(--emerald-400)" : "var(--text-secondary)",
              border: activeTab === "lifecycle" ? "1px solid var(--border-emerald)" : "1px solid transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.88rem",
              transition: "all 0.2s ease",
            }}
          >
            <Truck size={16} />
            <span>Role Actions</span>
          </button>

          <button
            onClick={() => setActiveTab("explorer")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.55rem 0.95rem",
              background: activeTab === "explorer" ? "rgba(16, 185, 129, 0.12)" : "transparent",
              color: activeTab === "explorer" ? "var(--emerald-400)" : "var(--text-secondary)",
              border: activeTab === "explorer" ? "1px solid var(--border-emerald)" : "1px solid transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.88rem",
              transition: "all 0.2s ease",
            }}
          >
            <Layers size={16} />
            <span>Audit Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.55rem 0.95rem",
              background: activeTab === "admin" ? "rgba(16, 185, 129, 0.12)" : "transparent",
              color: activeTab === "admin" ? "var(--emerald-400)" : "var(--text-secondary)",
              border: activeTab === "admin" ? "1px solid var(--border-emerald)" : "1px solid transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.88rem",
              transition: "all 0.2s ease",
            }}
          >
            <Shield size={16} />
            <span>RBAC Admin</span>
          </button>
        </nav>

        {/* Account & Role Switcher */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid var(--border-subtle)",
              padding: "0.45rem 0.85rem",
              borderRadius: "10px",
              cursor: "pointer",
              color: "var(--text-main)",
            }}
          >
            <div style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981",
            }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--emerald-400)", fontWeight: 600 }}>
                {getPrimaryRoleTitle()}
              </div>
              <div style={{ fontSize: "0.82rem", fontFamily: "var(--font-mono)" }}>
                {shortenAddress(account)}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {/* Account Dropdown Modal */}
          {showAccountDropdown && (
            <div
              className="glass-panel animate-slide-down"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "360px",
                padding: "1rem",
                zIndex: 200,
                background: "#0c1421",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-highlight)" }}>
                  Select Demonstration Role
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--emerald-400)" }}>
                  Hardhat Local (31337)
                </span>
              </div>

              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
                Switch between on-chain pre-authorized participant accounts for instant role-based testing:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {PRECONFIGURED_ACCOUNTS.map((acc, index) => {
                  const isCurrent = !isMetaMask && selectedPresetIndex === index;
                  return (
                    <div
                      key={acc.address}
                      onClick={() => {
                        selectPresetAccount(index);
                        setShowAccountDropdown(false);
                      }}
                      style={{
                        padding: "0.6rem 0.75rem",
                        borderRadius: "8px",
                        background: isCurrent ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)",
                        border: isCurrent ? "1px solid var(--emerald-500)" : "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.84rem", color: isCurrent ? "var(--emerald-400)" : "var(--text-main)" }}>
                          {acc.label}
                        </span>
                        {isCurrent && <CheckCircle size={14} color="#10b981" />}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {acc.description}
                      </div>
                      <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "#64748b", marginTop: "3px" }}>
                        {shortenAddress(acc.address)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "0.85rem", paddingTop: "0.85rem" }}>
                <button
                  onClick={() => {
                    connectMetaMask();
                    setShowAccountDropdown(false);
                  }}
                  className="btn btn-secondary"
                  style={{ width: "100%", fontSize: "0.82rem", padding: "0.55rem" }}
                >
                  <Wallet size={15} />
                  <span>{isMetaMask ? "Connected to MetaMask" : "Connect MetaMask Wallet"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
