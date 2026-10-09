// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title QuantumSanitizationRegistry
 * @notice Immutable decentralized ledger for post-quantum cryptographic sanitization proofs.
 * Compatible with EVM, Polygon, Arbitrum, and Ethereum Mainnet.
 */
contract QuantumSanitizationRegistry {
    address public immutable authority;

    struct SanitizationRecord {
        bytes32 hardwareSerialHash;    // Keccak-256 hash of physical hardware serial
        bytes32 quantumVerificationProof; // 512-bit collapsed entropy commitment (truncated to bytes32)
        uint64 timestamp;
        uint32 standardCode;           // 1 = DoD 5220.22-M, 2 = Gutmann, 3 = NIST 800-88 Purge
        address operatorAddress;
        bool isDecommissioned;
    }

    // Mapping from unique Certificate ID Hash => Sanitization Record
    mapping(bytes32 => SanitizationRecord) public certificates;

    event MediaPermanentlySanitized(
        bytes32 indexed certIdHash,
        bytes32 indexed hardwareSerialHash,
        uint32 indexed standardCode,
        uint64 timestamp,
        address operator
    );

    modifier onlyAuthority() {
        require(msg.sender == authority, "Unauthorized: Only certified authority can anchor proofs");
        _;
    }

    constructor() {
        authority = msg.sender;
    }

    /**
     * @notice Registers an immutable sanitization proof on the blockchain
     */
    function recordSanitization(
        bytes32 certIdHash,
        bytes32 hardwareSerialHash,
        bytes32 quantumVerificationProof,
        uint32 standardCode
    ) external onlyAuthority {
        require(!certificates[certIdHash].isDecommissioned, "Certificate already anchored on-chain");

        certificates[certIdHash] = SanitizationRecord({
            hardwareSerialHash: hardwareSerialHash,
            quantumVerificationProof: quantumVerificationProof,
            timestamp: uint64(block.timestamp),
            standardCode: standardCode,
            operatorAddress: msg.sender,
            isDecommissioned: true
        });

        emit MediaPermanentlySanitized(
            certIdHash,
            hardwareSerialHash,
            standardCode,
            uint64(block.timestamp),
            msg.sender
        );
    }

    /**
     * @notice Public audit verification method for legal & compliance discovery
     */
    function verifySanitization(bytes32 certIdHash) external view returns (
        bool verified,
        bytes32 hardwareSerialHash,
        bytes32 verificationProof,
        uint64 timestamp,
        uint32 standardCode
    ) {
        SanitizationRecord memory record = certificates[certIdHash];
        require(record.isDecommissioned, "Certificate not found on immutable ledger");
        return (
            true,
            record.hardwareSerialHash,
            record.quantumVerificationProof,
            record.timestamp,
            record.standardCode
        );
    }
}
