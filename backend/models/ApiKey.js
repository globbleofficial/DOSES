const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    key: { type: String, required: true, unique: true },
    name: { type: String, default: 'Default API Key' },
    permissions: [{ type: String, default: 'wipe:execute' }],
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ApiKey || mongoose.model('ApiKey', ApiKeySchema);
