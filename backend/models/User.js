const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    organization: { type: String, default: 'Independent Client' },
    department: { type: String, default: 'IT' },
    role: { type: String, enum: ['admin', 'auditor', 'operator', 'user'], default: 'user' },
    subscriptionTier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    wipesRemaining: { type: Number, default: 10 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
