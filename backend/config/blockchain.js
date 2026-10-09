const { ethers } = require('ethers');
const logger = require('../utils/logger');

class BlockchainConfig {
    constructor() {
        this.network = process.env.BLOCKCHAIN_NETWORK || 'Local Simulated EVM';
        this.rpcUrl = process.env.RPC_URL || '';
        this.privateKey = process.env.PRIVATE_KEY || '';
        this.contractAddress = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
        this.provider = null;
        this.wallet = null;
        this.isConfigured = false;

        this._init();
    }

    _init() {
        if (this.rpcUrl && this.privateKey) {
            try {
                this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
                this.wallet = new ethers.Wallet(this.privateKey, this.provider);
                this.isConfigured = true;
                logger.info(`Blockchain provider initialized on network: ${this.network}`);
            } catch (err) {
                logger.warn(`Could not connect to EVM RPC: ${err.message}. Using mock certification.`);
            }
        } else {
            logger.info('Blockchain credentials not set in .env. Running on Cryptographic Mock Anchor mode.');
        }
    }
}

module.exports = new BlockchainConfig();
