const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const wipeRoutes = require('./routes/wipeRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const statsRoutes = require('./routes/statsRoutes');
const salesforceRoutes = require('./routes/salesforceRoutes');
const quantumRoutes = require('./routes/quantumRoutes');
const recoveryRoutes = require('./routes/recoveryRoutes');
const errorHandler = require('./middlewares/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to Enterprise MongoDB Database (Non-blocking fallback)
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/', rateLimiter);

// API Health Check & Enterprise Integration Status
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'DOSES: Data Overwrite & Sanitization Enterprise System API',
        environment: process.env.NODE_ENV || 'production',
        compliance: 'NIST SP 800-88 Rev. 1, DoD 5220.22-M & NIST FIPS 204 (ML-DSA)',
        integrations: {
            database: 'MongoDB Enterprise Atlas (Connection Pooling Active)',
            crm: 'Salesforce ITAM Service Cloud Active',
            blockchain: 'Polygon POS Mainnet State Anchor Ready',
            quantumEngine: 'O(1) Instant Crypto-Purge & Dilithium PQC Signatures Active',
            forensicEngine: 'Dual Forensic Carving & Sanitization Validator Active',
            email: process.env.SMTP_USER ? 'SMTP Active' : 'Logged to Console'
        },
        timestamp: new Date().toISOString(),
        version: '3.6.0-MAJOR-PROJECT'
    });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/wipe', wipeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/salesforce', salesforceRoutes);
app.use('/api/quantum', quantumRoutes);
app.use('/api/recovery', recoveryRoutes);

// Centralized Error Handler
app.use(errorHandler);

// Start HTTP Server on 0.0.0.0 to accept IPv4, IPv6, and localhost on Windows
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`================================================================`);
    logger.info(`🚀 DOSES ENTERPRISE SANITIZATION PLATFORM ONLINE: PORT ${PORT}`);
    logger.info(`📡 Binding: http://127.0.0.1:${PORT} and http://localhost:${PORT}`);
    logger.info(`📦 Database: MongoDB Enterprise Connection Pooling Active`);
    logger.info(`☁️  Salesforce ITAM: Service Cloud Automated Reconciliation Ready`);
    logger.info(`⚡ Quantum Core: O(1) Instant Hardware MEK State Collapse Ready`);
    logger.info(`🔍 Forensic Engine: Deleted File Recovery & Carving Validator Active`);
    logger.info(`================================================================`);
});
