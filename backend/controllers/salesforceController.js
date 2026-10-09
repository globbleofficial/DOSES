const salesforceService = require('../services/salesforceService');
const Certificate = require('../models/Certificate');

exports.syncSanitizationToSalesforce = async (req, res) => {
    try {
        const { certificateId } = req.body;
        if (!certificateId) {
            return res.status(400).json({ error: 'Certificate ID is required for Salesforce sync' });
        }

        let cert = null;
        try {
            cert = await Certificate.findOne({ certificateId });
        } catch (e) {}

        const wipePayload = cert ? {
            serialNumber: cert.deviceSerialNumber || `SN-${cert.certificateId}`,
            driveLetter: cert.targetIdentifier,
            deviceModel: cert.deviceType,
            deviceSize: cert.deviceSize,
            wipeMethod: cert.wipeMethod,
            passes: cert.passes,
            verificationHash: cert.verificationHash,
            certificateId: cert.certificateId,
            transactionHash: cert.transactionHash,
            operatorEmail: cert.recipientEmail
        } : req.body;

        const syncResult = await salesforceService.syncDeviceSanitization(wipePayload);

        // Update certificate with Salesforce IDs if found
        if (cert && syncResult.synced) {
            cert.salesforceAssetId = syncResult.salesforceAssetId;
            cert.salesforceCaseId = syncResult.salesforceCaseId;
            cert.salesforceSyncStatus = 'SYNCED';
            await cert.save().catch(() => {});
        }

        res.json({
            success: true,
            syncResult
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesforceStatus = async (req, res) => {
    const isConfigured = Boolean(
        process.env.SALESFORCE_CLIENT_ID &&
        process.env.SALESFORCE_USERNAME &&
        process.env.SALESFORCE_PASSWORD
    );

    res.json({
        integration: 'Salesforce Enterprise IT Asset Management (ITAM)',
        status: isConfigured ? 'LIVE_OAUTH2_ACTIVE' : 'SIMULATED_ENTERPRISE_ACTIVE',
        targetObjects: ['Asset', 'Case', 'Sanitization_Record__c'],
        apiVersion: process.env.SALESFORCE_API_VERSION || 'v59.0',
        loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com'
    });
};
