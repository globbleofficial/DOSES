const crypto = require('crypto');
const blockchainConfig = require('../config/blockchain');
const logger = require('../utils/logger');

class BlockchainService {
    async anchorCertificate(certData) {
        const { certificateId, verificationHash } = certData;

        // Anchor on real EVM network if credentials exist
        if (blockchainConfig.isConfigured && blockchainConfig.wallet) {
            try {
                logger.info(`Submitting certificate hash ${verificationHash} to smart contract...`);
                const tx = await blockchainConfig.wallet.sendTransaction({
                    to: blockchainConfig.contractAddress,
                    data: '0x' + Buffer.from(verificationHash, 'utf8').toString('hex'),
                    value: 0
                });

                const receipt = await tx.wait();
                return {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    network: blockchainConfig.network,
                    status: 'confirmed_on_chain'
                };
            } catch (err) {
                logger.error('Blockchain on-chain anchoring failed:', err);
            }
        }

        // Cryptographic simulation anchor
        const mockTx = '0x' + crypto.randomBytes(32).toString('hex');
        const mockBlock = Math.floor(45000000 + Math.random() * 1000000);
        return {
            transactionHash: mockTx,
            blockNumber: mockBlock,
            network: blockchainConfig.network,
            status: 'mock_anchored'
        };
    }
}

module.exports = new BlockchainService();
