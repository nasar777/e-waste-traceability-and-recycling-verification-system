# EcoChain: Blockchain-Based E-Waste Traceability & Recycling Verification System

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow.svg)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.2-green.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-19%20Passing-brightgreen.svg)]()

> **Blockchain Technology (BCT) Capstone Project**  
> An immutable, role-governed decentralized application for tracking electronic waste from consumer registration through collection depots, freight transit, recycler dock receipt, and certified material recovery.

---

## 1. Project Overview & Architecture

EcoChain eliminates greenwashing, illegal dumping, and certificate fraud in e-waste management by establishing the blockchain as the single, immutable source of truth for all lifecycle state transitions.

```
┌────────────────────────────────────────────────────────┐
│               React + Vite Frontend (Port 5173)         │
│     - Dual Web3 Mode: 1-Click Role Switcher or MetaMask │
│     - Real-Time QR Passport Generator & Verifier       │
│     - Printable Certificate of Destruction & Recovery   │
└───────────────────────────┬────────────────────────────┘
                            │
              HTTP / REST   │   RPC (Ethers.js v6)
                            ▼
┌───────────────────────────┴────────────────────────────┐
│              Express.js REST API (Port 5000)            │
│   - Blockchain Health Diagnostics                      │
│   - Metadata Serialization & Search Caching             │
│   - MongoDB Integration (localhost:27017)              │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            Hardhat Local EVM Node (Port 8545)           │
│   - EcoChain.sol Smart Contract                        │
│   - OpenZeppelin AccessControl (RBAC) & ReentrancyGuard│
│   - Strict State Machine Transitions & Event Logs      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Five-Stage Lifecycle State Machine

1. **`Registered` (0):** Initial consumer drop-off logged with device specifications and unique e-waste ID. Emits `ItemRegistered`.
2. **`Collected` (1):** Authorized collection centre confirms physical intake and inspection. Restricted to `COLLECTION_CENTRE_ROLE`.
3. **`InTransit` (2):** Freight transporter logs chain-of-custody pickup and transit checkpoints. Restricted to `TRANSPORTER_ROLE`.
4. **`ReceivedAtRecycler` (3):** Certified recycling facility confirms dock arrival and security seals. Restricted to `RECYCLER_ROLE`.
5. **`RecyclingCompleted` (4):** Secondary materials recovered (grams), hazardous waste neutralized, and permanent `RecyclingCertificate` issued. Restricted to `RECYCLER_ROLE`.

---

## 3. Repository Structure

```
c:\BCT\
├── blockchain/                   # Solidity smart contract & Hardhat environment
│   ├── contracts/
│   │   └── EcoChain.sol          # Main RBAC & state-machine contract
│   ├── scripts/
│   │   └── deploy.js             # Deployment, role configuration & demo seeding
│   ├── test/
│   │   └── EcoChain.test.js      # 19 automated unit test cases
│   ├── hardhat.config.js         # Compiler settings (0.8.20, viaIR: true)
│   └── package.json
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/               # MongoDB & Blockchain RPC configuration
│   │   ├── controllers/          # Items, analytics & role controllers
│   │   ├── models/               # Mongoose schemas for off-chain metadata
│   │   ├── routes/               # API route definitions
│   │   └── index.js              # Server entry point
│   └── package.json
├── frontend/                     # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/           # UI components (Navbar, Stepper, Forms, Cert)
│   │   ├── context/              # WalletContext (MetaMask + 1-Click Role Switcher)
│   │   ├── services/             # API client functions
│   │   ├── App.jsx               # Main SPA routing container
│   │   └── index.css             # Obsidian & emerald glass design system
│   ├── vite.config.js            # Vite build configuration with API proxy
│   └── package.json
├── shared/                       # Shared contract deployment artifacts & ABI
│   └── contract-deployment.json
├── documentation/                # University course deliverables
│   ├── EcoChain_Academic_Report.md     # 16-section academic case study
│   ├── Presentation_Slide_Outline.md   # Slide-by-slide presentation deck outline
│   └── Video_Presentation_Script.md    # Timestamped video demonstration script
├── package.json                  # Root convenience scripts
└── README.md
```

---

## 4. Prerequisites & Environment

- **Node.js:** v18.0.0 or higher (v24.11.1 validated)
- **NPM:** v9.0.0 or higher (v11.6.2 validated)
- **MongoDB:** v6.0 or higher running on `127.0.0.1:27017`
- **Git** (optional)

---

## 5. Quick Start Instructions (Local Execution)

Follow these steps in separate terminal tabs:

### Step 1: Start the Local Hardhat Node
```powershell
cd c:\BCT\blockchain
npx hardhat node
```
*Starts an Ethereum node at `http://127.0.0.1:8545` with 20 pre-funded test accounts.*

### Step 2: Deploy the Smart Contract & Seed Demo Data
```powershell
cd c:\BCT\blockchain
npx hardhat run scripts/deploy.js --network localhost
```
*Compiles contracts with `viaIR: true`, deploys `EcoChain.sol`, grants operational roles, and seeds sample items (`EW-DEMO-001`, `EW-DEMO-002`).*

### Step 3: Launch the Backend API
```powershell
cd c:\BCT\backend
npm start
```
*API connects to MongoDB and Hardhat, listening on `http://localhost:5000`.*

### Step 4: Launch the Frontend Web Application
```powershell
cd c:\BCT\frontend
npm run dev
```
*Open `http://localhost:5173` in your web browser.*

---

## 6. Pre-Configured Test Accounts & Roles

The frontend features a **1-Click Role Switcher** in the top navigation bar. You do not need to manually configure MetaMask to test privileged on-chain operations:

| Role Name | Address | Private Key | Functionality |
| :--- | :--- | :--- | :--- |
| **Administrator** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac09...ff80` | Grants/revokes roles in Admin Console |
| **Collection Centre** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6...690d` | Confirms item collection at depots |
| **Transporter** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4...723b` | Updates transit status and checkpoints |
| **Recycler** | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c85...07a6` | Confirms receipt & issues certificates |
| **Demo Consumer** | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e1...8938` | Registers e-waste and tracks history |

*MetaMask Connection is also fully supported for evaluation if desired.*

---

## 7. Automated Testing & Verification

To run the complete automated test suite:
```powershell
cd c:\BCT\blockchain
npm test
```

### Test Suite Execution Output
```
  EcoChain Smart Contract
    1. Deployment and Access Control Setup
      √ Should set the deployer as DEFAULT_ADMIN_ROLE
      √ Should correctly assign initial participant roles
      √ Should allow admin to revoke and re-grant roles
      √ Should reject non-admin attempting to grant roles
      √ Should accurately return roles via checkUserRoles helper
    2. Item Registration
      √ Should allow consumer to register new e-waste item
      √ Should reject duplicate item IDs
      √ Should reject item registration with empty ID or empty type
    3. Lifecycle State Transitions and RBAC Enforcement
      √ Should allow Collection Centre to confirm collection
      √ Should reject unauthorized account attempting collection confirmation
      √ Should reject transporter jumping ahead before collection
      √ Should allow transporter to update transit status after collection
      √ Should reject recycler receiving item before transit begins
      √ Should allow recycler to confirm receipt when InTransit
    4. Recycling Completion and Certificate Issuance
      √ Should complete full lifecycle and issue verifiable certificate
      √ Should reject duplicate certificate issuance
      √ Should reject unauthorized user completing recycling
    5. Audit History and Query Integrity
      √ Should maintain full chronological immutable audit trail
      √ Should revert when querying non-existent item or certificate

  19 passing (2s)
```

---

## 8. REST API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health status of Express, MongoDB, and Ethereum RPC |
| `/api/contract/info` | `GET` | Deployed contract address, chain ID, and ABI |
| `/api/items` | `GET` | Returns all registered e-waste items from blockchain |
| `/api/items/:id` | `GET` | Returns item profile, chronological history & certificate |
| `/api/items/:id/history` | `GET` | Returns immutable audit trail of state transitions |
| `/api/items/:id/certificate` | `GET` | Returns official issued recycling certificate |
| `/api/items/:id/qr` | `GET` | Generates Base64/PNG verification QR passport |
| `/api/analytics` | `GET` | Aggregated metrics, pipeline counts, and CO2 savings |
| `/api/roles/:address` | `GET` | Inspects on-chain privileges for any Ethereum address |

---

## 9. Academic Course Deliverables Index

Detailed academic deliverables are located in the [`documentation/`](file:///c:/BCT/documentation) directory:
- [**EcoChain Academic Case Study Report**](file:///c:/BCT/documentation/EcoChain_Academic_Report.md): Full 16-section university paper with formal literature review, architecture diagrams, state models, and UN SDG mappings.
- [**Presentation Slide Deck Outline**](file:///c:/BCT/documentation/Presentation_Slide_Outline.md): Complete slide-by-slide structure for student presentations.
- [**Video Presentation Script**](file:///c:/BCT/documentation/Video_Presentation_Script.md): Timestamped spoken narrative for video evaluations and live demonstrations.
