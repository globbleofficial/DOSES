const instantCryptoPurge = require('../services/instantCryptoPurgeService');
const pqcSigner = require('../services/pqcSignatureService');
const salesforceService = require('../services/salesforceService');
const blockchainService = require('../services/blockchainService');
const Certificate = require('../models/Certificate');
const WipeLog = require('../models/WipeLog');
const logger = require('../utils/logger');

exports.executeInstantQuantumPurge = async (req, res) => {
    try {
        const {
            driveLetter,
            serialNumber,
            deviceModel,
            deviceSize,
            recipientEmail
        } = req.body;

        if (!driveLetter) {
            return res.status(400).json({ error: 'Target drive identifier is required' });
        }

        logger.info(`[Quantum Controller] Executing O(1) Instant Crypto-Purge on: ${driveLetter}`);

        // 1. Execute Instantaneous Hardware Cryptographic State Collapse (<300 ms)
        const purgeResult = await instantCryptoPurge.executeLightningCryptoPurge(driveLetter);

        // 2. Issue Post-Quantum Cryptographic (PQC) Signature (ML-DSA / Dilithium-5)
        const certId = `QPQC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const rawCertificateData = {
            certificateId: certId,
            target: driveLetter,
            serialNumber: serialNumber || `SN-${Buffer.from(driveLetter).toString('hex').toUpperCase()}`,
            deviceModel: deviceModel || 'NVMe/Flash Solid State Drive',
            method: purgeResult.method,
            durationMs: purgeResult.durationMs,
            verificationHash: purgeResult.verificationProofHash,
            timestamp: new Date().toISOString()
        };

        const pqcSignature = pqcSigner.signCertificate(rawCertificateData);

        // 3. Anchor to Blockchain
        const anchor = await blockchainService.anchorCertificate({
            certificateId: certId,
            verificationHash: purgeResult.verificationProofHash
        });

        // 4. Autonomous Salesforce ITAM Synchronization
        const salesforceSync = await salesforceService.syncDeviceSanitization({
            serialNumber: rawCertificateData.serialNumber,
            driveLetter,
            deviceModel: rawCertificateData.deviceModel,
            deviceSize: deviceSize || 'Hardware Capacity',
            wipeMethod: purgeResult.method,
            passes: 1, // Cryptographic purge is 1 instantaneous state collapse pass
            verificationHash: purgeResult.verificationProofHash,
            certificateId: certId,
            transactionHash: anchor.transactionHash,
            operatorEmail: recipientEmail || 'quantum-ops@google.com'
        });

        // 5. Store in MongoDB
        try {
            await Certificate.create({
                certificateId: certId,
                userName: req.user ? req.user.name : 'Quantum Systems Architect',
                recipientEmail: recipientEmail || 'secops@google.com',
                targetType: 'PHYSICAL_DRIVE',
                targetIdentifier: driveLetter,
                deviceSerialNumber: rawCertificateData.serialNumber,
                deviceModel: rawCertificateData.deviceModel,
                deviceType: 'NVMe / SSD / Removable Flash',
                deviceSize: deviceSize || '100% Full Media State Space',
                wipeMethod: 'O(1) Instant Cryptographic Purge (TCG Opal / NVMe)',
                passes: 1,
                verificationHash: purgeResult.verificationProofHash,
                transactionHash: anchor.transactionHash,
                blockNumber: anchor.blockNumber,
                network: anchor.network,
                status: anchor.status,
                salesforceAssetId: salesforceSync.salesforceAssetId,
                salesforceCaseId: salesforceSync.salesforceCaseId,
                salesforceSyncStatus: 'SYNCED',
                salesforceSyncTimestamp: new Date()
            });

            await WipeLog.create({
                operationType: 'DRIVE_WIPE',
                targetName: driveLetter,
                algorithm: 'INSTANT_CRYPTO_PURGE',
                passes: 1,
                status: 'completed',
                verificationHash: purgeResult.verificationProofHash,
                certificateId: certId,
                durationSeconds: purgeResult.durationMs / 1000
            });
        } catch (dbErr) {
            logger.warn(`Database logging notice: ${dbErr.message}`);
        }

        res.json({
            success: true,
            executionSpeed: 'Lightning Fast (Sub-Second)',
            durationMs: purgeResult.durationMs,
            certificate: {
                ...rawCertificateData,
                pqcSignature,
                blockchainAnchor: anchor,
                salesforceSync
            }
        });

    } catch (error) {
        logger.error('[Quantum Controller Error]:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.verifyPQCCertificate = async (req, res) => {
    try {
        const { certificateData, pqcSignature } = req.body;
        if (!certificateData || !pqcSignature) {
            return res.status(400).json({ error: 'Missing certificate data or signature payload' });
        }

        const verification = pqcSigner.verifyPQCSignature(certificateData, pqcSignature);
        res.json({
            verified: verification.isValid,
            details: verification
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
