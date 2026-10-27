import React, { useState } from "react";
import { WalletProvider, useWallet } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import RegisterItem from "./components/RegisterItem";
import TrackItem from "./components/TrackItem";
import LifecycleActions from "./components/LifecycleActions";
import AdminPanel from "./components/AdminPanel";
import ItemsExplorer from "./components/ItemsExplorer";
import RecyclingCertificateModal from "./components/RecyclingCertificateModal";
import { fetchItemById } from "./services/api";
import { RotateCcw, ShieldCheck, Heart, Leaf } from "lucide-react";

function MainContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [activeCertificateItem, setActiveCertificateItem] = useState(null);

  const handleSelectTrackItem = (id) => {
    setSelectedTrackId(id);
    setActiveTab("track");
  };

  const handleViewCertificate = async (item) => {
    // If the passed item object doesn't have the certificate hydrated yet, fetch it
    if (!item.certificate && item.itemId) {
      try {
        const fullItemRes = await fetchItemById(item.itemId);
        if (fullItemRes.success) {
          setActiveCertificateItem(fullItemRes.data);
          return;
        }
      } catch (e) {
        console.error("Error loading certificate details:", e);
      }
    }
    setActiveCertificateItem(item);
  };

  const handleRegisteredSuccess = (newId) => {
    setSelectedTrackId(newId);
    setActiveTab("track");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container" style={{ flex: 1 }}>
        {activeTab === "dashboard" && (
          <Dashboard
            setActiveTab={setActiveTab}
            onSelectTrackItem={handleSelectTrackItem}
          />
        )}

        {activeTab === "register" && (
          <RegisterItem onRegisteredSuccess={handleRegisteredSuccess} />
        )}

        {activeTab === "track" && (
          <TrackItem
            initialItemId={selectedTrackId}
            onViewCertificate={handleViewCertificate}
          />
        )}

        {activeTab === "lifecycle" && (
          <LifecycleActions
            onViewCertificate={handleViewCertificate}
            onActionCompleted={() => {}}
          />
        )}

        {activeTab === "explorer" && (
          <ItemsExplorer
            onSelectTrackItem={handleSelectTrackItem}
            onViewCertificate={handleViewCertificate}
          />
        )}

        {activeTab === "admin" && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="no-print" style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "rgba(8, 13, 20, 0.95)",
        padding: "2rem 0",
        marginTop: "3rem",
      }}>
        <div className="container" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <RotateCcw size={15} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontWeight: 700, color: "var(--text-main)" }}>EcoChain</span> — Blockchain E-Waste Traceability & Recycling Verification
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Leaf size={14} color="#10b981" />
              <span>UN SDGs 12 & 13 Aligned</span>
            </span>
            <span>•</span>
            <span>BCT Course Capstone Project</span>
            <span>•</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--emerald-400)" }}>Hardhat EVM Localhost</span>
          </div>
        </div>
      </footer>

      {/* Certificate Modal */}
      {activeCertificateItem && (
        <RecyclingCertificateModal
          item={activeCertificateItem}
          onClose={() => setActiveCertificateItem(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <MainContent />
    </WalletProvider>
  );
}
