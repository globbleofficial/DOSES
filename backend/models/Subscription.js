const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    monthlyQuota: { type: Number, default: 10 },
    usedQuota: { type: Number, default: 0 },
    validUntil: { type: Date },
    active: { type: Boolean, default: true }
});

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
