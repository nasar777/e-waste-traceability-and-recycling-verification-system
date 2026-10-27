import React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  FileCheck2,
  Printer,
  X,
  ShieldCheck,
  Award,
  Leaf,
  CheckCircle,
  ExternalLink
} from "lucide-react";

export default function RecyclingCertificateModal({ item, onClose }) {
  if (!item || !item.certificate) return null;

  const cert = item.certificate;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="glass-panel animate-slide-down"
        style={{
          width: "100%",
          maxWidth: "820px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          background: "#0a101d",
          border: "2px solid var(--border-emerald)",
          position: "relative",
        }}
      >
        {/* Modal Controls (No Print) */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--emerald-400)", fontWeight: 700 }}>
            <Award size={20} />
            <span>Verifiable On-Chain Recycling Certificate</span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem" }}>
              <Printer size={15} />
              <span>Print Official Certificate</span>
            </button>
            <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "0.45rem 0.75rem" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Certificate Paper Body */}
        <div
          className="certificate-paper"
          style={{
            background: "linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(6, 182, 212, 0.02) 100%), #0c1424",
            border: "2px solid rgba(16, 185, 129, 0.4)",
            borderRadius: "16px",
            padding: "2.5rem",
            position: "relative",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          }}
        >
          {/* Certificate Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem", borderBottom: "1px solid rgba(16, 185, 129, 0.25)", paddingBottom: "1.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.85rem", borderRadius: "999px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid var(--border-emerald)", color: "var(--emerald-400)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              <ShieldCheck size={16} />
              <span>EcoChain Circular Economy Verification</span>
            </div>

            <h1 style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--text-highlight)", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
              Certificate of E-Waste Recycling & Material Recovery
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "600px", margin: "0 auto" }}>
              This certifies that the electronic equipment specified below was formally received, dismantled, and processed in compliance with Environmental Protection standards and verified on the Ethereum distributed ledger.
            </p>
          </div>

          {/* Certificate Key Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            {/* Left Box: Item Profile */}
            <div style={{ background: "rgba(13, 21, 34, 0.8)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem", fontWeight: 700 }}>
                Catalogued Equipment Details
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.86rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>E-Waste ID:</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--cyan-400)" }}>{item.itemId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Item Description:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-highlight)" }}>{item.brandModel}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Category:</span>
                  <span>{item.itemType}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Serial Number:</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{item.serialNumber}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Gross Weight:</span>
                  <span>{item.weightKg} kg ({item.weightGrams}g)</span>
                </div>
              </div>
            </div>

            {/* Right Box: Recycling & Recovery Details */}
            <div style={{ background: "rgba(13, 21, 34, 0.8)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem", fontWeight: 700 }}>
                Recycling & Destruction Record
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.86rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Certificate ID:</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--emerald-400)" }}>{cert.certificateId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Recycling Facility:</span>
                  <span style={{ textAlign: "right", maxWidth: "180px", color: "var(--text-highlight)" }}>{cert.recyclingFacility}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Recovery Method:</span>
                  <span style={{ textAlign: "right", maxWidth: "180px" }}>{cert.recoveryMethod}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Recovered Secondary Materials:</span>
                  <span style={{ fontWeight: 700, color: "var(--emerald-400)" }}>{cert.recoveredMaterialsWeightKg} kg ({cert.recoveredMaterialsWeightGrams}g)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Hazardous Disposal Ref:</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{cert.hazardousWasteDisposalRef}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Footer: Cryptographic Signature & QR */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem",
            background: "rgba(16, 185, 129, 0.08)",
            padding: "1.25rem 1.5rem",
            borderRadius: "12px",
            border: "1px solid var(--border-emerald)",
          }}>
            <div style={{ maxWidth: "480px" }}>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Authorized Recycler Ethereum Signer
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--cyan-400)", wordBreak: "break-all", margin: "3px 0 6px" }}>
                {cert.recyclerAddress}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                Timestamp: {new Date(cert.completionDate).toUTCString()}
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "4px", fontStyle: "italic" }}>
                Distinction Notice: This certificate cryptographically authenticates the reported physical recycling receipt and metallurgical recovery under ISO 14001 guidelines on the EcoChain ledger.
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "0.5rem", borderRadius: "10px", display: "inline-block" }}>
              <QRCodeSVG
                value={JSON.stringify({
                  certificate: cert.certificateId,
                  itemId: cert.itemId,
                  facility: cert.recyclingFacility,
                  recycler: cert.recyclerAddress,
                  verified: true,
                })}
                size={88}
                level="M"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
