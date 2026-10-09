const deviceService = require('../services/deviceService');
const driveWiperService = require('../services/driveWiperService');
const hashService = require('../services/hashService');
const blockchainService = require('../services/blockchainService');
const emailService = require('../services/emailService');
const salesforceService = require('../services/salesforceService');
const Certificate = require('../models/Certificate');
const WipeLog = require('../models/WipeLog');
const logger = require('../utils/logger');

exports.listDevices = async (req, res) => {
    try {
        const drives = await deviceService.listDrives();
        res.json({
            success: true,
            count: drives.length,
            drives
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.wipeDevice = async (req, res) => {
    try {
        const {
            driveLetter,
            wipeMethod = 'dod',
            recipientEmail,
            deviceType,
            deviceSize,
            deviceModel,
            serialNumber
        } = req.body;

        if (!driveLetter) {
            return res.status(400).json({ error: 'Target drive letter / identifier is required' });
        }

        logger.info(`[Device Controller] Sanitizing drive: ${driveLetter}, Method: ${wipeMethod}`);

        // 1. Execute physical drive volume sanitization
        const result = await driveWiperService.wipeEntireDrive(driveLetter, wipeMethod);

        // 2. Generate Certificate ID & Anchor to Blockchain
        const certId = hashService.generateCertificateId();
        const anchor = await blockchainService.anchorCertificate({
            certificateId: certId,
            verificationHash: result.verificationHash
        });

        // 3. Construct Certificate Payload
        const certPayload = {
            certificateId: certId,
            userName: req.user ? req.user.name : 'Google ITAD Security Officer',
            recipientEmail: recipientEmail || (req.user ? req.user.email : 'security-ops@google.com'),
            targetType: 'PHYSICAL_DRIVE',
            targetIdentifier: `${driveLetter} Storage Media`,
            deviceSerialNumber: serialNumber || `SN-DRIVE-${Date.now().toString(36).toUpperCase()}`,
            deviceModel: deviceModel || 'Enterprise Storage Platter',
            deviceType: deviceType || 'USB / External Hard Drive',
            deviceSize: deviceSize || 'Full Volume Sanitized',
            wipeMethod: wipeMethod.toUpperCase(),
            passes: wipeMethod === 'gutmann' ? 35 : (wipeMethod === 'random' ? 7 : 3),
            verificationHash: result.verificationHash,
            transactionHash: anchor.transactionHash,
            blockNumber: anchor.blockNumber,
            network: anchor.network,
            status: anchor.status
        };

        // 4. Automatically Sync to Salesforce Enterprise ITAM
        logger.info('[Device Controller] Triggering automated Salesforce Asset & Case synchronization...');
        const salesforceSync = await salesforceService.syncDeviceSanitization({
            serialNumber: certPayload.deviceSerialNumber,
            driveLetter,
            deviceModel: certPayload.deviceModel,
            deviceSize: certPayload.deviceSize,
            wipeMethod: certPayload.wipeMethod,
            passes: certPayload.passes,
            verificationHash: certPayload.verificationHash,
            certificateId: certPayload.certificateId,
            transactionHash: certPayload.transactionHash,
            operatorEmail: certPayload.recipientEmail
        });

        if (salesforceSync && salesforceSync.synced) {
            certPayload.salesforceAssetId = salesforceSync.salesforceAssetId;
            certPayload.salesforceCaseId = salesforceSync.salesforceCaseId;
            certPayload.salesforceSyncStatus = 'SYNCED';
            certPayload.salesforceSyncTimestamp = new Date();
        }

        // 5. Persist to MongoDB
        try {
            await Certificate.create(certPayload);
            await WipeLog.create({
                operationType: 'DRIVE_WIPE',
                targetName: driveLetter,
                algorithm: wipeMethod,
                passes: certPayload.passes,
                status: 'completed',
                verificationHash: result.verificationHash,
                certificateId: certId,
                durationSeconds: result.durationSeconds
            });
        } catch (dbErr) {
            logger.warn(`Database persistence warning: ${dbErr.message}`);
        }

        // 6. Send Automated Compliance Certificate via Email
        await emailService.sendSanitizationCertificate(certPayload.recipientEmail, certPayload);

        res.json({
            success: true,
            message: `Drive ${driveLetter} completely sanitized and verified.`,
            certificate: certPayload,
            salesforceSync
        });

    } catch (error) {
        logger.error('[Device Wipe Error]:', error);
        res.status(500).json({ error: error.message });
    }
};
