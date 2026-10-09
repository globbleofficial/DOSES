const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const createTransporter = () => {
    const isConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

    if (!isConfigured) {
        logger.info('SMTP Credentials not provided. Certificate emails will be logged to console.');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

module.exports = createTransporter();
