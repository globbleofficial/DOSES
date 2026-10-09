const crypto = require('crypto');

class HashService {
    generateVerificationHash(targetName, method, timestamp = Date.now()) {
        const seed = `${targetName}_${method}_${timestamp}_${crypto.randomBytes(16).toString('hex')}`;
        return crypto.createHash('sha256').update(seed).digest('hex');
    }

    generateCertificateId() {
        const rand = crypto.randomBytes(6).toString('hex').toUpperCase();
        return `SWP-${Date.now().toString(36).toUpperCase()}-${rand}`;
    }
}

module.exports = new HashService();
