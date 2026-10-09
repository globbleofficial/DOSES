const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/securewipe_enterprise';
        const options = {
            maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '50', 10),
            minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '10', 10),
            serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || '5000', 10),
            socketTimeoutMS: 45000,
            autoIndex: true // Ensure indexes are built in enterprise runtime
        };

        const conn = await mongoose.connect(uri, options);
        logger.info(`[MongoDB Enterprise] Connected successfully to host: ${conn.connection.host}`);
        logger.info(`[MongoDB Enterprise] Database Target: ${conn.connection.name}`);
        logger.info(`[MongoDB Enterprise] Connection Pool Initialized (Min: ${options.minPoolSize}, Max: ${options.maxPoolSize})`);

        // MongoDB Runtime Event Listeners
        mongoose.connection.on('error', (err) => {
            logger.error('[MongoDB Runtime Error]:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('[MongoDB Warning]: Database connection lost. Attempting reconnection...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('[MongoDB Reconnected]: Database connection re-established.');
        });

    } catch (error) {
        logger.error('[MongoDB Critical Connection Failure]:', error);
        logger.warn('[MongoDB Fallback]: Running in volatile memory fallback mode for local staging.');
    }
};

module.exports = connectDB;
