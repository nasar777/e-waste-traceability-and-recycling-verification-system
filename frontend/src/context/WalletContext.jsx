import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { fetchContractInfo } from "../services/api";

const WalletContext = createContext(null);

export const PRECONFIGURED_ACCOUNTS = [
  {
    roleName: "Administrator",
    label: "Admin (Deployer)",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    description: "Grants & manages authorized network participant roles",
  },
  {
    roleName: "Collection Centre",
    label: "Collection Centre (Depot 12)",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    description: "Confirms physical drop-off & intake inspection",
  },
  {
    roleName: "Transporter",
    label: "Transporter (EcoLogistics)",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb2f95408212906e5ac20638706227c2f16723b",
    description: "Updates real-time transit checkpoints & custody",
  },
  {
    roleName: "Recycler",
    label: "Recycler (CleanTech Plant)",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    description: "Confirms receipt and issues immutable Recycling Certificate",
  },
  {
    roleName: "Consumer",
    label: "Consumer (Green Citizen)",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    privateKey: "0x47e179ec197488593b10025e709a3f20d20d43ac5faec4520977239f83648938",
    description: "Registers initial e-waste & tracks item lifecycle",
  },
];

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);
  const [account, setAccount] = useState("");
  const [isMetaMask, setIsMetaMask] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0); // Default to Admin
  const [balance, setBalance] = useState("0");
  const [roles, setRoles] = useState({
    isAdmin: false,
    isCollectionCentre: false,
    isTransporter: false,
    isRecycler: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize RPC and Contract Info
  const initBlockchain = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchContractInfo();
      if (!res.success || !res.data.address) {
        throw new Error("Contract deployment data unavailable");
      }
      setContractInfo(res.data);

      const rpcProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      setProvider(rpcProvider);

      // Default to the first preconfigured account for easy testing
      const defaultPreset = PRECONFIGURED_ACCOUNTS[0];
      const localWallet = new ethers.Wallet(defaultPreset.privateKey, rpcProvider);
      setSigner(localWallet);
      setAccount(localWallet.address);
      setIsMetaMask(false);

      const contractInstance = new ethers.Contract(res.data.address, res.data.abi, localWallet);
      setContract(contractInstance);

      // Check balance and roles
      const bal = await rpcProvider.getBalance(localWallet.address);
      setBalance(ethers.formatEther(bal));

      await refreshUserRoles(contractInstance, localWallet.address);
    } catch (err) {
      console.error("[WalletContext] Initialization failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const PRESET_ROLES = [
    { isAdmin: true, isCollectionCentre: false, isTransporter: false, isRecycler: false },
    { isAdmin: false, isCollectionCentre: true, isTransporter: false, isRecycler: false },
    { isAdmin: false, isCollectionCentre: false, isTransporter: true, isRecycler: false },
    { isAdmin: false, isCollectionCentre: false, isTransporter: false, isRecycler: true },
    { isAdmin: false, isCollectionCentre: false, isTransporter: false, isRecycler: false },
  ];

  const refreshUserRoles = async (contractInstance, targetAddress) => {
    if (!targetAddress) return;
    try {
      if (contractInstance) {
        const result = await contractInstance.checkUserRoles(targetAddress);
        setRoles({
          isAdmin: Boolean(result[0]),
          isCollectionCentre: Boolean(result[1]),
          isTransporter: Boolean(result[2]),
          isRecycler: Boolean(result[3]),
        });
        return;
      }
    } catch (e) {
      console.warn("Direct contract checkUserRoles note:", e.message);
    }

    // Fallback to backend API
    try {
      const res = await fetch(`/api/roles/${encodeURIComponent(targetAddress)}`).then((r) => r.json());
      if (res.success && res.roles) {
        setRoles(res.roles);
      }
    } catch (apiErr) {
      console.warn("Backend role lookup note:", apiErr.message);
    }
  };

  useEffect(() => {
    initBlockchain();
  }, [initBlockchain]);

  // Switch to a preconfigured Hardhat account
  const selectPresetAccount = async (index) => {
    const preset = PRECONFIGURED_ACCOUNTS[index];
    if (!preset) return;

    try {
      setLoading(true);
      setSelectedPresetIndex(index);
      setIsMetaMask(false);
      setAccount(preset.address);

      // Immediately set the verified preconfigured roles so UI updates with zero latency
      if (PRESET_ROLES[index]) {
        setRoles(PRESET_ROLES[index]);
      }

      if (provider) {
        const localWallet = new ethers.Wallet(preset.privateKey, provider);
        setSigner(localWallet);

        if (contractInfo && contractInfo.address) {
          const contractInstance = new ethers.Contract(contractInfo.address, contractInfo.abi, localWallet);
          setContract(contractInstance);
          await refreshUserRoles(contractInstance, preset.address);
        }

        const bal = await provider.getBalance(preset.address);
        setBalance(ethers.formatEther(bal));
      }
    } catch (err) {
      console.error("Account switch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask extension is not detected in your browser. You can use the built-in Demo Role Switcher to test all functions directly!");
      return;
    }

    try {
      setLoading(true);
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const browserSigner = await browserProvider.getSigner();
      const currentAddress = accounts[0];

      setProvider(browserProvider);
      setSigner(browserSigner);
      setAccount(currentAddress);
      setIsMetaMask(true);

      if (contractInfo) {
        const contractInstance = new ethers.Contract(contractInfo.address, contractInfo.abi, browserSigner);
        setContract(contractInstance);
        const bal = await browserProvider.getBalance(currentAddress);
        setBalance(ethers.formatEther(bal));
        await refreshUserRoles(contractInstance, currentAddress);
      }
    } catch (err) {
      console.error("MetaMask connection failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch balance and roles
  const refreshWalletState = async () => {
    if (contract && account && provider) {
      try {
        const bal = await provider.getBalance(account);
        setBalance(ethers.formatEther(bal));
        await refreshUserRoles(contract, account);
      } catch (err) {
        console.warn("Error refreshing state:", err);
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        contract,
        contractInfo,
        account,
        isMetaMask,
        selectedPresetIndex,
        balance,
        roles,
        loading,
        error,
        selectPresetAccount,
        connectMetaMask,
        refreshWalletState,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
