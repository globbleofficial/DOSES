const axios = require('axios');
const salesforceConfig = require('../config/salesforce');
const logger = require('../utils/logger');

class SalesforceService {
    /**
     * Synchronizes a completed sanitization record into Salesforce ITAM / Service Cloud
     * 1. Looks up the hardware Asset in Salesforce by Serial Number
     * 2. Updates Asset status to 'Sanitized - Decommissioned'
     * 3. Attaches verification certificate ID, Blockchain transaction hash, and timestamp
     * 4. Auto-creates/closes a Decommissioning IT Case in Salesforce Service Cloud
     */
    async syncDeviceSanitization(wipeRecord) {
        const {
            serialNumber,
            driveLetter,
            deviceModel,
            deviceSize,
            wipeMethod,
            passes,
            verificationHash,
            certificateId,
            transactionHash,
            operatorEmail
        } = wipeRecord;

        logger.info(`[Salesforce Service] Initiating sync for Serial: ${serialNumber || driveLetter}`);

        const auth = await salesforceConfig.getAuthenticatedClient();

        // If credentials are not set, return simulated Enterprise Salesforce synchronization
        if (!auth) {
            logger.info('[Salesforce Mock] Simulated Salesforce sync completed successfully.');
            return {
                synced: true,
                mode: 'SIMULATED_ENTERPRISE',
                salesforceAssetId: `02i8W00000${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                salesforceCaseId: `5008W00000${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                syncTimestamp: new Date().toISOString(),
                syncedFields: {
                    SerialNumber: serialNumber || 'USB-STORAGE-GENERIC',
                    Sanitization_Status__c: 'Sanitized & Verified',
                    Compliance_Standard__c: `${wipeMethod} (${passes} Passes)`,
                    Certificate_ID__c: certificateId,
                    Blockchain_TX__c: transactionHash,
                    Verification_Hash__c: verificationHash
                }
            };
        }

        try {
            const headers = {
                Authorization: `Bearer ${auth.accessToken}`,
                'Content-Type': 'application/json'
            };

            // 1. Search for existing Asset by SerialNumber
            let assetId = null;
            if (serialNumber) {
                const queryUrl = `${auth.instanceUrl}/services/data/${auth.apiVersion}/query?q=${encodeURIComponent(
                    `SELECT Id, Name, Status, SerialNumber FROM Asset WHERE SerialNumber = '${serialNumber}' LIMIT 1`
                )}`;

                const queryRes = await axios.get(queryUrl, { headers });
                if (queryRes.data.records && queryRes.data.records.length > 0) {
                    assetId = queryRes.data.records[0].Id;
                    logger.info(`[Salesforce Service] Found existing Asset in Salesforce: ${assetId}`);
                }
            }

            // 2. If Asset exists, update it. If not, create a new Asset record.
            const assetPayload = {
                Name: `${deviceModel || 'Storage Media'} - ${serialNumber || driveLetter}`,
                SerialNumber: serialNumber || `SERIAL-${Date.now()}`,
                Status: 'Decommissioned / Sanitized',
                Description: `Sanitized by SecureWipe Pro. Method: ${wipeMethod} (${passes} passes). Verification Hash: ${verificationHash}. Cert ID: ${certificateId}. Anchor TX: ${transactionHash}`
            };

            if (assetId) {
                // Update Asset
                await axios.patch(
                    `${auth.instanceUrl}/services/data/${auth.apiVersion}/sobjects/Asset/${assetId}`,
                    assetPayload,
                    { headers }
                );
                logger.info(`[Salesforce Service] Asset ${assetId} updated with sanitization records.`);
            } else {
                // Create Asset
                const createRes = await axios.post(
                    `${auth.instanceUrl}/services/data/${auth.apiVersion}/sobjects/Asset`,
                    assetPayload,
                    { headers }
                );
                assetId = createRes.data.id;
                logger.info(`[Salesforce Service] Created new Asset ${assetId} in Salesforce.`);
            }

            // 3. Create or Close Decommissioning Case in Salesforce Service Cloud
            let caseId = null;
            if (process.env.SALESFORCE_AUTO_CLOSE_CASES === 'true') {
                const casePayload = {
                    Subject: `Hardware Decommissioning: ${deviceModel || serialNumber || driveLetter} Sanitized`,
                    Description: `Automated Sanitization verification completed. Target media has been wiped in compliance with DoD 5220.22-M / NIST 800-88.\nCertificate ID: ${certificateId}\nVerification Hash: ${verificationHash}`,
                    Status: 'Closed',
                    Priority: 'Medium',
                    Origin: 'Automated SecureWipe Pro System'
                };

                const caseRes = await axios.post(
                    `${auth.instanceUrl}/services/data/${auth.apiVersion}/sobjects/Case`,
                    casePayload,
                    { headers }
                );
                caseId = caseRes.data.id;
                logger.info(`[Salesforce Service] Decommissioning Case ${caseId} created and resolved.`);
            }

            return {
                synced: true,
                mode: 'LIVE_SALESFORCE',
                salesforceAssetId: assetId,
                salesforceCaseId: caseId,
                syncTimestamp: new Date().toISOString()
            };

        } catch (error) {
            const errData = error.response ? error.response.data : error.message;
            logger.error('[Salesforce Sync Failure]:', errData);
            return {
                synced: false,
                error: errData
            };
        }
    }
}

module.exports = new SalesforceService();
