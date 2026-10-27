import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet, PRECONFIGURED_ACCOUNTS } from "../context/WalletContext";
import { fetchRolesForAddress } from "../services/api";
import {
  Shield,
  UserCheck,
  UserX,
  Search,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info
} from "lucide-react";

export default function AdminPanel() {
  const { contract, account, roles, contractInfo, refreshWalletState } = useWallet();

  const ROLE_OPTIONS = [
    { label: "Collection Centre Role", hash: ethers.keccak256(ethers.toUtf8Bytes("COLLECTION_CENTRE_ROLE")) },
    { label: "Transporter Role", hash: ethers.keccak256(ethers.toUtf8Bytes("TRANSPORTER_ROLE")) },
    { label: "Recycler Role", hash: ethers.keccak256(ethers.toUtf8Bytes("RECYCLER_ROLE")) },
  ];

  const [selectedRoleHash, setSelectedRoleHash] = useState(ROLE_OPTIONS[0].hash);
  const [targetAddress, setTargetAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(null);
  const [adminError, setAdminError] = useState("");

  // Role Inspector State
  const [inspectAddress, setInspectAddress] = useState("");
  const [inspectResult, setInspectResult] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const handleGrantRole = async (e) => {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess(null);

    if (!roles.isAdmin) {
      setAdminError("Access Denied: Only accounts with DEFAULT_ADMIN_ROLE can grant roles. Please switch to Admin in the top-right menu.");
      return;
    }

    if (!ethers.isAddress(targetAddress)) {
      setAdminError("Please enter a valid Ethereum address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const tx = await contract.grantRole(selectedRoleHash, targetAddress.trim());
      const receipt = await tx.wait();
      await refreshWalletState();

      const matchedRole = ROLE_OPTIONS.find((r) => r.hash === selectedRoleHash);
      setAdminSuccess({
        type: "grant",
        message: `Successfully granted ${matchedRole.label} to ${targetAddress}`,
        txHash: receipt.hash,
      });
    } catch (err) {
      console.error(err);
      setAdminError(err.reason || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeRole = async () => {
    setAdminError("");
    setAdminSuccess(null);

    if (!roles.isAdmin) {
      setAdminError("Access Denied: Only accounts with DEFAULT_ADMIN_ROLE can revoke roles.");
      return;
    }

    if (!ethers.isAddress(targetAddress)) {
      setAdminError("Please enter a valid Ethereum address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const tx = await contract.revokeRole(selectedRoleHash, targetAddress.trim());
      const receipt = await tx.wait();
      await refreshWalletState();

      const matchedRole = ROLE_OPTIONS.find((r) => r.hash === selectedRoleHash);
      setAdminSuccess({
        type: "revoke",
        message: `Successfully revoked ${matchedRole.label} from ${targetAddress}`,
        txHash: receipt.hash,
      });
    } catch (err) {
      console.error(err);
      setAdminError(err.reason || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectRoles = async (addrToInspect) => {
    const addr = (addrToInspect || inspectAddress).trim();
    if (!ethers.isAddress(addr)) {
      setAdminError("Please enter a valid Ethereum address to inspect.");
      return;
    }

    try {
      setInspectLoading(true);
      const res = await fetchRolesForAddress(addr);
      if (res.success) {
        setInspectResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInspectLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 0 3rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Role-Based Access Control (RBAC) Console</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Manage cryptographic authorizations for participating organizations. Only authorized smart-contract administrators can grant or revoke lifecycle privileges.
        </p>
      </div>

      {!roles.isAdmin && (
        <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(251, 191, 36, 0.12)", border: "1px solid rgba(251, 191, 36, 0.35)", color: "#fef08a", fontSize: "0.88rem", display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem" }}>
          <Info size={20} />
          <div>
            <strong>Notice:</strong> Your currently selected account does not hold the <code>DEFAULT_ADMIN_ROLE</code>. Role modifications will be rejected on-chain. Use the <strong>Role Switcher</strong> in the top navigation bar to select <strong>Admin (Deployer)</strong>.
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem" }}>
        {/* Role Assignment Form */}
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Key size={18} color="var(--emerald-400)" />
            <span>Grant or Revoke Organization Roles</span>
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
            Directly executes OpenZeppelin <code>AccessControl</code> state updates on the contract.
          </p>

          <form onSubmit={handleGrantRole}>
            <div className="form-group">
              <label className="form-label">Select Target Role</label>
              <select
                className="form-select"
                value={selectedRoleHash}
                onChange={(e) => setSelectedRoleHash(e.target.value)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.hash} value={opt.hash}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Ethereum Account Address</label>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.88rem" }}
                placeholder="0x..."
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                required
              />
            </div>

            {/* Quick Fill Preconfigured Buttons */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", width: "100%" }}>Quick fill test accounts:</span>
              {PRECONFIGURED_ACCOUNTS.slice(1, 4).map((acc) => (
                <button
                  type="button"
                  key={acc.address}
                  onClick={() => setTargetAddress(acc.address)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                    borderRadius: "6px",
                    padding: "0.2rem 0.5rem",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                  }}
                >
                  {acc.roleName}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {isSubmitting ? <Loader2 size={16} className="pulse-live" /> : <UserCheck size={16} />}
                <span>Grant Role</span>
              </button>

              <button
                type="button"
                onClick={handleRevokeRole}
                disabled={isSubmitting}
                className="btn btn-danger"
              >
                <UserX size={16} />
                <span>Revoke</span>
              </button>
            </div>
          </form>

          {adminSuccess && (
            <div className="glass-panel animate-slide-down" style={{ marginTop: "1.25rem", padding: "1rem", border: "1px solid var(--border-emerald)", background: "rgba(16, 185, 129, 0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--emerald-400)", fontWeight: 600, fontSize: "0.9rem" }}>
                <CheckCircle2 size={16} />
                <span>Transaction Mined</span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                {adminSuccess.message}
              </div>
              <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--cyan-400)", marginTop: "4px", wordBreak: "break-all" }}>
                Tx: {adminSuccess.txHash}
              </div>
            </div>
          )}

          {adminError && (
            <div style={{ marginTop: "1.25rem", padding: "0.85rem", borderRadius: "8px", background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)", color: "#fda4af", fontSize: "0.84rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <AlertCircle size={16} />
              <span>{adminError}</span>
            </div>
          )}
        </div>

        {/* Address Role Inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Search size={18} color="var(--cyan-400)" />
              <span>Live Address Privilege Inspector</span>
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Query the smart contract directly to verify assigned on-chain roles for any account.
            </p>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
                placeholder="Enter Ethereum Address (0x...)"
                value={inspectAddress}
                onChange={(e) => setInspectAddress(e.target.value)}
              />
              <button
                onClick={() => handleInspectRoles()}
                disabled={inspectLoading}
                className="btn btn-secondary"
              >
                <span>Inspect</span>
              </button>
            </div>

            {inspectResult && (
              <div style={{ background: "rgba(10, 16, 26, 0.7)", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Target Account:</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--cyan-400)", wordBreak: "break-all", marginBottom: "0.75rem" }}>
                  {inspectResult.address}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.84rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>DEFAULT_ADMIN_ROLE:</span>
                    <span style={{ fontWeight: 600, color: inspectResult.roles.isAdmin ? "var(--emerald-400)" : "#64748b" }}>
                      {inspectResult.roles.isAdmin ? "TRUE (Authorized)" : "FALSE"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>COLLECTION_CENTRE_ROLE:</span>
                    <span style={{ fontWeight: 600, color: inspectResult.roles.isCollectionCentre ? "var(--emerald-400)" : "#64748b" }}>
                      {inspectResult.roles.isCollectionCentre ? "TRUE (Authorized)" : "FALSE"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>TRANSPORTER_ROLE:</span>
                    <span style={{ fontWeight: 600, color: inspectResult.roles.isTransporter ? "var(--emerald-400)" : "#64748b" }}>
                      {inspectResult.roles.isTransporter ? "TRUE (Authorized)" : "FALSE"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>RECYCLER_ROLE:</span>
                    <span style={{ fontWeight: 600, color: inspectResult.roles.isRecycler ? "var(--emerald-400)" : "#64748b" }}>
                      {inspectResult.roles.isRecycler ? "TRUE (Authorized)" : "FALSE"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Smart Contract Technical Parameters */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Contract Deployment State</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Address:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--cyan-400)" }}>{contractInfo?.address}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Deployer Admin:</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{contractInfo?.deployer}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Solidity Version:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--emerald-400)" }}>^0.8.20 (viaIR: true)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Consensus Engine:</span>
                <span>Automated Hardhat EVM (Localhost)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
