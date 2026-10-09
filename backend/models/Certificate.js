const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    certificateId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    targetType: { type: String, enum: ['FILE', 'DIRECTORY', 'PHYSICAL_DRIVE', 'URL'], default: 'PHYSICAL_DRIVE' },
    targetIdentifier: { type: String, required: true },
    deviceSerialNumber: { type: String, index: true }, // Hardware Serial Number for Salesforce Asset Lookup
    deviceModel: { type: String },
    deviceType: { type: String, required: true },
    deviceSize: { type: String, required: true },
    wipeMethod: { type: String, required: true },
    passes: { type: Number, required: true },
    verificationHash: { type: String, required: true, index: true },
    transactionHash: { type: String, required: true },
    blockNumber: { type: Number, default: 0 },
    network: { type: String, default: 'Polygon POS Mainnet' },
    status: { type: String, default: 'confirmed' },

    // Salesforce Enterprise Sync Fields
    salesforceAssetId: { type: String, index: true },
    salesforceCaseId: { type: String },
    salesforceSyncStatus: { type: String, enum: ['PENDING', 'SYNCED', 'FAILED'], default: 'PENDING' },
    salesforceSyncTimestamp: { type: Date },

    createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
