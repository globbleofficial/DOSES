const mongoose = require('mongoose');

const WipeLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    operationType: { type: String, enum: ['UPLOAD_WIPE', 'DRIVE_WIPE', 'URL_WIPE', 'LOCAL_PATH_WIPE'], required: true },
    targetName: { type: String, required: true },
    targetSizeFormatted: { type: String },
    algorithm: { type: String, required: true },
    passes: { type: Number, required: true },
    status: { type: String, enum: ['started', 'in_progress', 'completed', 'failed'], default: 'started' },
    verificationHash: { type: String },
    certificateId: { type: String },
    durationSeconds: { type: Number, default: 0 },
    errorMessage: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.WipeLog || mongoose.model('WipeLog', WipeLogSchema);
