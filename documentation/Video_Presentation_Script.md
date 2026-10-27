# EcoChain: Video Presentation & Live Demonstration Script
**Project:** EcoChain — Blockchain-Based E-Waste Traceability and Recycling Verification System  
**Course:** Blockchain Technology (BCT) Capstone Project  
**Estimated Video Duration:** 8 to 10 Minutes  

---

### [00:00 - 01:15] Section 1: Introduction & Problem Context
*(Visual: Presenter on camera or Slide 1, followed by footage of global e-waste statistics)*

**Speaker:**
> "Hello everyone, my name is [Your Name], and today I am excited to present **EcoChain**, our Blockchain Technology capstone project.
> 
> Electronic waste, or e-waste, is currently the fastest-growing solid waste stream on our planet. Over 62 million metric tonnes of computers, phones, and appliances are discarded every year. These devices contain toxic heavy metals like lead and mercury, but also valuable strategic resources like gold, silver, and copper.
> 
> The core problem today is not just recycling—it is **trust and traceability**. Traditional recycling supply chains rely on fragmented, centralized databases or paper manifests. Unscrupulous waste handlers frequently commit 'greenwashing'—claiming government recycling subsidies and carbon credits without actually recycling the equipment, or shipping it illegally to informal dumpsites.
> 
> To solve this, we built **EcoChain**: a decentralized e-waste traceability and verification platform powered by Ethereum smart contracts, role-based access control, and verifiable cryptographic certificates."

---

### [01:15 - 02:45] Section 2: Architecture & Why Blockchain?
*(Visual: Architecture diagram on Slide 5 & 6)*

**Speaker:**
> "Why is blockchain the necessary technology here? 
> 
> In traditional software, a database administrator can modify timestamps or delete records. But in e-waste reverse logistics, multiple competing entities—consumers, independent municipal drop-off hubs, third-party trucking companies, and certified recycling plants—must collaborate without having to blindly trust one another.
> 
> A blockchain provides three critical guarantees:
> 1. **Immutability:** Once a drop-off or transit event is mined into a block, it can never be altered or erased.
> 2. **Cryptographic Non-Repudiation:** Every action is digitally signed by an authorized Ethereum address using their private key.
> 3. **State Machine Enforcement:** The Solidity smart contract enforces a strict five-stage lifecycle: *Registered*, *Collected*, *InTransit*, *ReceivedAtRecycler*, and *RecyclingCompleted*. An item cannot jump ahead or bypass mandatory steps.
> 
> Our technology stack includes:
> - Solidity smart contracts built with OpenZeppelin security standards.
> - A local Hardhat EVM blockchain environment.
> - A Node.js and Express backend with MongoDB for metadata caching.
> - And a modern React and Vite single-page frontend with Ethers.js v6."

---

### [02:45 - 04:15] Section 3: Smart Contract & RBAC Walkthrough
*(Visual: Split screen showing `EcoChain.sol` in VS Code or Slide 8)*

**Speaker:**
> "Let us look at the smart contract design in `EcoChain.sol`.
> 
> We implement OpenZeppelin's `AccessControl`. We define three specific operational roles: `COLLECTION_CENTRE_ROLE`, `TRANSPORTER_ROLE`, and `RECYCLER_ROLE`, alongside the `DEFAULT_ADMIN_ROLE`.
> 
> Privileged functions use the `onlyRole` modifier. For instance, when a collection centre calls `confirmCollection`, the EVM checks that `msg.sender` holds `COLLECTION_CENTRE_ROLE`. Furthermore, the contract asserts that the item actually exists and that its current state is strictly `LifecycleStatus.Registered`. If an unauthorized wallet attempts this call, or if someone tries to collect an item twice, the transaction immediately reverts with a custom error, consuming minimal gas.
> 
> When recycling is complete, the recycler calls `completeRecycling()`. This function records the exact weight of secondary materials recovered in grams, logs the environmental hazardous disposal reference, updates the status to `RecyclingCompleted`, and issues a permanent `RecyclingCertificate` struct stored in contract state."

---

### [04:15 - 07:15] Section 4: Live Application Demonstration
*(Visual: Screen recording of the live EcoChain web interface at `http://localhost:5173`)*

**Speaker:**
> "Now, let us demonstrate the live application running against our local Hardhat blockchain.
> 
> **[Step 1: Dashboard Overview]**
> Here on our Dashboard, we see our live system metrics: total items registered, recycling completions verified, active items in logistics, and our carbon avoidance calculation. Notice that the contract address is displayed directly at `0x5FbDB2315678afecb367f032d93F642f64180aa3`.
> 
> Notice also our Demonstration Role Switcher in the top right. We can switch between pre-authorized test accounts—Admin, Collection Centre, Transporter, Recycler, and Consumer—with a single click, or connect directly with MetaMask.
> 
> **[Step 2: Consumer Registration]**
> Let us act as a Consumer. We navigate to the **Register E-Waste** tab. I will generate a unique ID: `EW-2026-LIVE01`. I select 'Smartphone', brand 'Samsung Galaxy S22', weight 228 grams, enter its serial number, and note that the lithium battery is intact. Notice how the dynamic QR passport preview generates in real time. 
> 
> I click 'Register Item On-Chain'. The transaction is submitted and mined into the local block! We get back the confirmed transaction hash.
> 
> **[Step 3: Track & Trace Initial State]**
> If we now go to **Track & Trace**, we see our item profile. The lifecycle timeline shows Step 1: Registered by our consumer address.
> 
> **[Step 4: Collection Centre Intake]**
> Now, let us switch to the **Collection Centre** role using our top switcher. We go to **Role Actions**, under Collection Centre. We select our item, specify the location as 'Metro Collection Depot 12', and click 'Confirm Collection On-Chain'. The transaction confirms! The item's state on the blockchain is now officially `Collected`.
> 
> If an unauthorized account attempted this, the contract would revert.
> 
> **[Step 5: Transporter Custody]**
> Next, we switch our role to **Transporter**. We go to the Transporter tab, select the item, and record our logistics truck checkpoint: 'Highway Corridor 101, Cargo Pallet #7'. The state transitions to `InTransit`.
> 
> **[Step 6: Recycler Processing & Certificate Generation]**
> Finally, we switch to our **Recycler** account. In the Recycler portal, we first confirm physical dock arrival at 'CleanTech Recovery Plant'. Then, under Step B, we complete recycling. We input the recovery method: 'Hydrometallurgical Precious Metals Extraction', enter 195 grams of recovered copper and gold, and submit!
> 
> The confetti triggers, and our official **Recycling Certificate** is generated!
> 
> If we open the certificate, we see an official Certificate of Destruction and Material Recovery with the unique certificate ID, the recycler's verified Ethereum address, the ISO 14001 plant reference, and a scannable verification QR code. We can print this certificate directly for regulatory compliance."

---

### [07:15 - 08:30] Section 5: Testing & Verification Results
*(Visual: Terminal showing `npm test` passing output and test table)*

**Speaker:**
> "To guarantee code correctness, we implemented a comprehensive unit test suite in Hardhat. 
> 
> Running `npm test` executes **19 automated test cases** covering:
> - Administrative role assignments and revocations.
> - Preventing non-admins from modifying privileges.
> - Rejecting duplicate item registrations and empty parameters.
> - Enforcing strict sequence progression and rejecting out-of-order calls.
> - Validating certificate issuance and non-duplication.
> 
> All 19 tests pass with zero failures in just two seconds."

---

### [08:30 - 09:30] Section 6: UN SDGs, Limitations & Conclusion
*(Visual: Slide 12 and 13 with SDG icons)*

**Speaker:**
> "EcoChain directly supports the United Nations Sustainable Development Goals:
> - **SDG 12:** Responsible Consumption and Production, ensuring toxic materials do not contaminate the biosphere.
> - **SDG 13:** Climate Action, displacing virgin mining emissions by recovering secondary precious metals.
> - **SDG 9:** Innovation and circular infrastructure.
> 
> In terms of limitations, smart contracts verify data integrity once entered, but bridging physical verification requires automated hardware scanners—which we plan to address in future work via IoT smart container seals and decentralized oracles.
> 
> In conclusion, EcoChain demonstrates that blockchain can transform environmental reverse logistics from an opaque, fraud-prone system into a transparent, verifiable circular economy.
> 
> Thank you for your time, and I am now ready for your questions!"
