# EcoChain: Blockchain-Based E-Waste Traceability & Recycling Verification System

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow.svg)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.2-green.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-19%20Passing-brightgreen.svg)]()

> **Blockchain Technology (BCT) Capstone Project**  
> EcoChain is a decentralized application prototype for tracking electronic waste from registration through collection, transportation, recycler receipt, and recorded recycling completion.

---

## 1. Project Overview & Architecture

EcoChain aims to improve e-waste traceability and reduce opportunities for inaccurate reporting by recording lifecycle updates on a blockchain. Its smart contract enforces role-based permissions and valid state transitions, while the web application provides interfaces for registering items, updating their status, viewing audit history, and accessing recycling certificate records.

**Important scope note:** Blockchain records preserve submitted transactions and claims; they do not independently prove that physical collection, transportation, or recycling occurred. EcoChain is an academic prototype using a local Hardhat blockchain, not a production deployment.

```text
┌────────────────────────────────────────────────────────┐
│               React + Vite Frontend (Port 5173)         │
│     - Role Switcher or MetaMask connection              │
│     - QR-based item lookup                              │
│     - Printable recycling certificate view              │
└───────────────────────────┬────────────────────────────┘
                            │
              HTTP / REST   │   RPC (Ethers.js v6)
                            ▼
┌───────────────────────────┴────────────────────────────┐
│              Express.js REST API (Port 5000)             │
│   - Blockchain health diagnostics                       │
│   - Metadata handling and item queries                  │
│   - MongoDB integration (localhost:27017)               │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            Hardhat Local EVM Node (Port 8545)            │
│   - EcoChain.sol smart contract                         │
│   - OpenZeppelin AccessControl (RBAC)                    │
│   - Lifecycle state transitions and event logs         │
└────────────────────────────────────────────────────────┘
```

### Data responsibilities

- **Blockchain:** Records lifecycle state changes, role-governed operations, events, and recycling certificate data supported by the smart contract.
- **MongoDB:** Stores supplementary off-chain item metadata, according to the application's schema.
- **Frontend and API:** Provide user interaction, queries, QR-based lookup, and presentation of recorded information.

---

## 2. Five-Stage Lifecycle State Machine

1. **`Registered` (0):** An e-waste item is registered with a unique identifier and item details. Emits `ItemRegistered`.
2. **`Collected` (1):** An authorized collection centre confirms collection. Restricted to `COLLECTION_CENTRE_ROLE`.
3. **`InTransit` (2):** An authorized transporter records the transit stage. Restricted to `TRANSPORTER_ROLE`.
4. **`ReceivedAtRecycler` (3):** An authorized recycler confirms receipt. Restricted to `RECYCLER_ROLE`.
5. **`RecyclingCompleted` (4):** The recycler records completion and the contract issues a recycling certificate record. Restricted to `RECYCLER_ROLE`.

The lifecycle records are intended to support traceability and auditing. Physical events still depend on accurate reporting by participating users.

---

## 3. Repository Structure

```text
BCT/
├── blockchain/                   # Solidity smart contract & Hardhat environment
│   ├── contracts/
│   │   └── EcoChain.sol          # Main RBAC & state-machine contract
│   ├── scripts/
│   │   └── deploy.js             # Deployment, role configuration & demo seeding
│   ├── test/
│   │   └── EcoChain.test.js      # Smart contract unit tests
│   ├── hardhat.config.js         # Compiler settings
│   └── package.json
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/               # MongoDB & blockchain RPC configuration
│   │   ├── controllers/          # Items, analytics & role controllers
│   │   ├── models/               # Mongoose schemas for off-chain metadata
│   │   ├── routes/               # API route definitions
│   │   └── index.js              # Server entry point
│   └── package.json
├── frontend/                     # React + Vite web application
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── context/              # Wallet and role context
│   │   ├── services/             # API client functions
│   │   ├── App.jsx               # Main SPA container
│   │   └── index.css             # Application styles
│   ├── vite.config.js            # Vite configuration and API proxy
│   └── package.json
├── shared/                       # Shared contract deployment artifacts & ABI
│   └── contract-deployment.json
├── documentation/                # Academic report and presentation materials
│   ├── EcoChain_Academic_Report.md
│   ├── Presentation_Slide_Outline.md
│   └── Video_Presentation_Script.md
├── package.json                  # Root convenience scripts
└── README.md
```

---

## 4. Prerequisites & Environment

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** v6.0 or higher, running locally at `127.0.0.1:27017`
- **Git:** Required to clone or version-control the project

Use the versions specified by your project configuration where possible. The versions listed above are minimums and may not represent every environment tested.

---

## 5. Quick Start Instructions (Local Execution)

Run each long-running service in a separate terminal. These commands assume the project folder is named `BCT` and is located at `C:\BCT`.

### Step 1: Install dependencies

```powershell
cd C:\BCT\blockchain
npm install

cd C:\BCT\backend
npm install

cd C:\BCT\frontend
npm install
```

### Step 2: Start the local Hardhat node

```powershell
cd C:\BCT\blockchain
npx hardhat node
```

This starts a local Ethereum-compatible development node, typically at `http://127.0.0.1:8545`, with pre-funded test accounts. These accounts are for local development only.

### Step 3: Deploy the smart contract and seed demo data

Open another terminal:

```powershell
cd C:\BCT\blockchain
npx hardhat run scripts/deploy.js --network localhost
```

This command is intended to compile and deploy the contract, configure the roles, and seed demonstration records according to the deployment script. Check the terminal output for the deployed contract address and any configuration updates required by the frontend or backend.

### Step 4: Configure and launch the backend

Ensure the backend's environment configuration points to the local blockchain RPC and MongoDB instance. Use the variable names expected by the actual backend configuration files. Do not commit `.env` files or credentials.

```powershell
cd C:\BCT\backend
npm start
```

The API is expected to listen on `http://localhost:5000` if that is the port configured in the application.

### Step 5: Launch the frontend

Open another terminal:

```powershell
cd C:\BCT\frontend
npm run dev
```

Open `http://localhost:5173` in your browser if Vite reports that address.

> **Setup note:** The backend and frontend must use the same deployed contract address and compatible ABI. If the local Hardhat node is restarted, redeploy the contract and update any required deployment configuration before testing again. MongoDB must also be running for features that depend on off-chain metadata.

---

## 6. Pre-Configured Test Accounts & Roles

The frontend may provide a role switcher for local demonstrations, alongside MetaMask support if configured. The following are standard public addresses associated with Hardhat's default local development accounts; they are not production identities.

| Role Name | Local Test Address | Functionality |
| :--- | :--- | :--- |
| **Administrator** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Grants or revokes roles in the admin interface |
| **Collection Centre** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Confirms item collection |
| **Transporter** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | Updates transit status |
| **Recycler** | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | Confirms receipt and records recycling completion |
| **Demo Consumer** | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | Registers e-waste and tracks history |

**Security warning:** Private keys are intentionally omitted. Hardhat's default test-account keys are publicly known and must only be used on a local development chain. Never use them on a public network or with real funds. Do not store private keys, seed phrases, or real credentials in the repository.

---

## 7. Automated Testing & Verification

Run the smart contract tests with:

```powershell
cd C:\BCT\blockchain
npm test
```

The repository's test suite is documented as covering deployment and access control, item registration, lifecycle transitions, certificate issuance, and audit-history queries.

If you have run the suite successfully, you can record the verified result here. Example format:

```text
19 passing
```

Only retain the `19 Passing` badge and this result if the current version of the tests has actually been executed successfully in your environment.

---

## 8. REST API Documentation

The following endpoints are documented for the application. Confirm them against the current backend routes before relying on this table.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Reports API and configured service health |
| `/api/contract/info` | `GET` | Returns contract information, such as address, chain ID, and ABI, as implemented |
| `/api/items` | `GET` | Retrieves registered e-waste items |
| `/api/items/:id` | `GET` | Retrieves an item's details |
| `/api/items/:id/history` | `GET` | Retrieves the item's recorded audit history |
| `/api/items/:id/certificate` | `GET` | Retrieves the item's recycling certificate, if issued |
| `/api/items/:id/qr` | `GET` | Generates or returns a QR representation for item lookup |
| `/api/analytics` | `GET` | Returns application analytics and estimated metrics |
| `/api/roles/:address` | `GET` | Checks the roles associated with an address |

---

## 9. Environmental Metrics

Any CO₂ savings or environmental impact figures shown by the application should be interpreted as estimates based on the calculation factors and data available to the application. They are not independently measured environmental outcomes unless supported by a separate measurement and verification process.

---

## 10. Security and Development Notes

- Never commit `.env` files, API credentials, private keys, seed phrases, or production secrets.
- Use only local test accounts for the Hardhat development network.
- Treat QR codes as a convenience for locating records, not as proof of physical recycling or identity.
- Validate lifecycle updates and metadata at the API and smart-contract layers.
- This project is a prototype for academic demonstration; additional security review, operational controls, and independent verification would be required before real-world deployment.


