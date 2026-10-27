// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EcoChain
 * @dev Blockchain-Based E-Waste Traceability and Recycling Verification System
 * Implements strict role-based access control, cryptographic verification of lifecycle events,
 * and tamper-proof recycling certificates.
 */
contract EcoChain is AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant COLLECTION_CENTRE_ROLE = keccak256("COLLECTION_CENTRE_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant RECYCLER_ROLE = keccak256("RECYCLER_ROLE");

    // Lifecycle status enum
    enum LifecycleStatus {
        Registered,          // 0: Registered by consumer/originator
        Collected,           // 1: Picked up/received by authorized Collection Centre
        InTransit,           // 2: Handed to authorized transporter, in transit
        ReceivedAtRecycler,  // 3: Received at authorized recycling facility
        RecyclingCompleted   // 4: Processing complete, materials recovered, certificate generated
    }

    // Item struct
    struct Item {
        string itemId;
        string itemType;
        string brandModel;
        uint256 weightGrams;
        string serialNumber;
        address registeredBy;
        uint256 registrationTimestamp;
        LifecycleStatus currentStatus;
        bool exists;
    }

    // Historical status audit record
    struct StatusUpdate {
        LifecycleStatus status;
        address updatedBy;
        string updaterRole;
        uint256 timestamp;
        string location;
        string remarks;
    }

    // Verifiable Recycling Certificate
    struct RecyclingCertificate {
        string certificateId;
        string itemId;
        uint256 completionTimestamp;
        address recyclerAddress;
        string recyclingFacility;
        string recoveryMethod;
        uint256 recoveredMaterialsWeightGrams;
        string hazardousWasteDisposalRef;
        string remarks;
        bool issued;
    }

    // Storage
    mapping(string => Item) private items;
    mapping(string => StatusUpdate[]) private itemHistory;
    mapping(string => RecyclingCertificate) private recyclingCertificates;
    string[] private allItemIds;

    // Metrics counters
    uint256 public totalRegisteredItems;
    uint256 public totalCompletedRecycling;

    // Events
    event ItemRegistered(
        string indexed itemId,
        string itemType,
        string brandModel,
        uint256 weightGrams,
        address indexed registeredBy,
        uint256 timestamp
    );

    event StatusUpdated(
        string indexed itemId,
        LifecycleStatus indexed status,
        address indexed updatedBy,
        string updaterRole,
        string location,
        string remarks,
        uint256 timestamp
    );

    event RecyclingCompletedEvent(
        string indexed itemId,
        string certificateId,
        address indexed recyclerAddress,
        string recyclingFacility,
        string recoveryMethod,
        uint256 recoveredMaterialsWeightGrams,
        uint256 timestamp
    );

    /**
     * @dev Constructor grants DEFAULT_ADMIN_ROLE to deployer.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // --- Core Lifecycle Functions ---

    /**
     * @notice Register a new e-waste item into the traceability system.
     * @dev Callable by any consumer or registered entity. Prevents duplicate item IDs.
     */
    function registerItem(
        string calldata itemId,
        string calldata itemType,
        string calldata brandModel,
        uint256 weightGrams,
        string calldata serialNumber,
        string calldata location,
        string calldata remarks
    ) external nonReentrant {
        require(bytes(itemId).length > 0, "EcoChain: Item ID cannot be empty");
        require(bytes(itemType).length > 0, "EcoChain: Item type cannot be empty");
        require(!items[itemId].exists, "EcoChain: Item ID already exists");

        items[itemId] = Item({
            itemId: itemId,
            itemType: itemType,
            brandModel: brandModel,
            weightGrams: weightGrams,
            serialNumber: serialNumber,
            registeredBy: msg.sender,
            registrationTimestamp: block.timestamp,
            currentStatus: LifecycleStatus.Registered,
            exists: true
        });

        allItemIds.push(itemId);
        totalRegisteredItems += 1;

        // Record initial history entry
        itemHistory[itemId].push(StatusUpdate({
            status: LifecycleStatus.Registered,
            updatedBy: msg.sender,
            updaterRole: "Consumer",
            timestamp: block.timestamp,
            location: bytes(location).length > 0 ? location : "Origin",
            remarks: bytes(remarks).length > 0 ? remarks : "Initial e-waste registration"
        }));

        emit ItemRegistered(itemId, itemType, brandModel, weightGrams, msg.sender, block.timestamp);
        emit StatusUpdated(
            itemId,
            LifecycleStatus.Registered,
            msg.sender,
            "Consumer",
            location,
            remarks,
            block.timestamp
        );
    }

    /**
     * @notice Confirm physical collection of registered e-waste.
     * @dev Restricted to authorized COLLECTION_CENTRE_ROLE.
     */
    function confirmCollection(
        string calldata itemId,
        string calldata location,
        string calldata remarks
    ) external onlyRole(COLLECTION_CENTRE_ROLE) nonReentrant {
        require(items[itemId].exists, "EcoChain: Item does not exist");
        require(
            items[itemId].currentStatus == LifecycleStatus.Registered,
            "EcoChain: Invalid status transition. Item must be in 'Registered' state"
        );

        items[itemId].currentStatus = LifecycleStatus.Collected;

        itemHistory[itemId].push(StatusUpdate({
            status: LifecycleStatus.Collected,
            updatedBy: msg.sender,
            updaterRole: "Collection Centre",
            timestamp: block.timestamp,
            location: location,
            remarks: remarks
        }));

        emit StatusUpdated(
            itemId,
            LifecycleStatus.Collected,
            msg.sender,
            "Collection Centre",
            location,
            remarks,
            block.timestamp
        );
    }

    /**
     * @notice Update transportation / transit progress of collected e-waste.
     * @dev Restricted to authorized TRANSPORTER_ROLE. Can transition from Collected to InTransit,
     * or record transit checkpoints while InTransit.
     */
    function updateTransitStatus(
        string calldata itemId,
        string calldata location,
        string calldata remarks
    ) external onlyRole(TRANSPORTER_ROLE) nonReentrant {
        require(items[itemId].exists, "EcoChain: Item does not exist");
        require(
            items[itemId].currentStatus == LifecycleStatus.Collected ||
            items[itemId].currentStatus == LifecycleStatus.InTransit,
            "EcoChain: Invalid status transition. Item must be 'Collected' or 'InTransit'"
        );

        items[itemId].currentStatus = LifecycleStatus.InTransit;

        itemHistory[itemId].push(StatusUpdate({
            status: LifecycleStatus.InTransit,
            updatedBy: msg.sender,
            updaterRole: "Transporter",
            timestamp: block.timestamp,
            location: location,
            remarks: remarks
        }));

        emit StatusUpdated(
            itemId,
            LifecycleStatus.InTransit,
            msg.sender,
            "Transporter",
            location,
            remarks,
            block.timestamp
        );
    }

    /**
     * @notice Confirm physical receipt of e-waste shipment at the recycling plant.
     * @dev Restricted to authorized RECYCLER_ROLE.
     */
    function confirmRecyclerReceipt(
        string calldata itemId,
        string calldata location,
        string calldata remarks
    ) external onlyRole(RECYCLER_ROLE) nonReentrant {
        require(items[itemId].exists, "EcoChain: Item does not exist");
        require(
            items[itemId].currentStatus == LifecycleStatus.InTransit,
            "EcoChain: Invalid status transition. Item must be 'InTransit'"
        );

        items[itemId].currentStatus = LifecycleStatus.ReceivedAtRecycler;

        itemHistory[itemId].push(StatusUpdate({
            status: LifecycleStatus.ReceivedAtRecycler,
            updatedBy: msg.sender,
            updaterRole: "Recycler",
            timestamp: block.timestamp,
            location: location,
            remarks: remarks
        }));

        emit StatusUpdated(
            itemId,
            LifecycleStatus.ReceivedAtRecycler,
            msg.sender,
            "Recycler",
            location,
            remarks,
            block.timestamp
        );
    }

    /**
     * @notice Report recycling completion, recover materials, and issue immutable certificate.
     * @dev Restricted to authorized RECYCLER_ROLE. Note: distinguishes reported completion
     * on-chain from physical execution according to ISO/EPA standards.
     */
    function completeRecycling(
        string calldata itemId,
        string calldata certificateId,
        string calldata recyclingFacility,
        string calldata recoveryMethod,
        uint256 recoveredMaterialsWeightGrams,
        string calldata hazardousWasteDisposalRef,
        string calldata remarks
    ) external onlyRole(RECYCLER_ROLE) nonReentrant {
        require(items[itemId].exists, "EcoChain: Item does not exist");
        require(
            items[itemId].currentStatus == LifecycleStatus.ReceivedAtRecycler,
            "EcoChain: Invalid status transition. Item must be 'ReceivedAtRecycler'"
        );
        require(bytes(certificateId).length > 0, "EcoChain: Certificate ID cannot be empty");
        require(!recyclingCertificates[itemId].issued, "EcoChain: Certificate already issued");

        items[itemId].currentStatus = LifecycleStatus.RecyclingCompleted;
        totalCompletedRecycling += 1;

        recyclingCertificates[itemId] = RecyclingCertificate({
            certificateId: certificateId,
            itemId: itemId,
            completionTimestamp: block.timestamp,
            recyclerAddress: msg.sender,
            recyclingFacility: recyclingFacility,
            recoveryMethod: recoveryMethod,
            recoveredMaterialsWeightGrams: recoveredMaterialsWeightGrams,
            hazardousWasteDisposalRef: hazardousWasteDisposalRef,
            remarks: remarks,
            issued: true
        });

        itemHistory[itemId].push(StatusUpdate({
            status: LifecycleStatus.RecyclingCompleted,
            updatedBy: msg.sender,
            updaterRole: "Recycler",
            timestamp: block.timestamp,
            location: recyclingFacility,
            remarks: string.concat("Recycling verified. Certificate: ", certificateId)
        }));

        emit RecyclingCompletedEvent(
            itemId,
            certificateId,
            msg.sender,
            recyclingFacility,
            recoveryMethod,
            recoveredMaterialsWeightGrams,
            block.timestamp
        );

        emit StatusUpdated(
            itemId,
            LifecycleStatus.RecyclingCompleted,
            msg.sender,
            "Recycler",
            recyclingFacility,
            remarks,
            block.timestamp
        );
    }

    // --- Query and View Functions ---

    /**
     * @notice Get item core details by ID.
     */
    function getItem(string calldata itemId) external view returns (Item memory) {
        require(items[itemId].exists, "EcoChain: Item not found");
        return items[itemId];
    }

    /**
     * @notice Get chronological lifecycle audit trail for an item.
     */
    function getItemHistory(string calldata itemId) external view returns (StatusUpdate[] memory) {
        require(items[itemId].exists, "EcoChain: Item not found");
        return itemHistory[itemId];
    }

    /**
     * @notice Retrieve the issued recycling certificate for an item.
     */
    function getRecyclingCertificate(string calldata itemId) external view returns (RecyclingCertificate memory) {
        require(items[itemId].exists, "EcoChain: Item not found");
        require(recyclingCertificates[itemId].issued, "EcoChain: No certificate issued for this item");
        return recyclingCertificates[itemId];
    }

    /**
     * @notice Get all registered item IDs.
     */
    function getAllItemIds() external view returns (string[] memory) {
        return allItemIds;
    }

    /**
     * @notice Get total item count.
     */
    function getItemCount() external view returns (uint256) {
        return allItemIds.length;
    }

    /**
     * @notice Check active roles for a given account.
     */
    function checkUserRoles(address account) external view returns (
        bool isAdmin,
        bool isCollectionCentre,
        bool isTransporter,
        bool isRecycler
    ) {
        isAdmin = hasRole(DEFAULT_ADMIN_ROLE, account);
        isCollectionCentre = hasRole(COLLECTION_CENTRE_ROLE, account);
        isTransporter = hasRole(TRANSPORTER_ROLE, account);
        isRecycler = hasRole(RECYCLER_ROLE, account);
    }

    /**
     * @notice Get high-level contract statistics for analytics.
     */
    function getSystemMetrics() external view returns (
        uint256 totalRegistered,
        uint256 totalCompleted,
        uint256 totalInPipeline
    ) {
        totalRegistered = totalRegisteredItems;
        totalCompleted = totalCompletedRecycling;
        totalInPipeline = totalRegisteredItems > totalCompletedRecycling ? totalRegisteredItems - totalCompletedRecycling : 0;
    }
}
