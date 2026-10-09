const path = require('path');
const fs = require('fs-extra');
const recoveryService = require('../services/recoveryService');
const logger = require('../utils/logger');

exports.scanForDeletedFiles = async (req, res) => {
    try {
        const { targetPath = 'D:\\' } = req.body;
        logger.info(`[Recovery Controller] Initiating forensic recovery scan on: ${targetPath}`);

        const result = await recoveryService.scanAndRecover(targetPath);
        res.json({
            success: true,
            result
        });
    } catch (error) {
        logger.error('[Recovery Scan Error]:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.downloadRecoveredFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const safeFilename = path.basename(filename);
        const filePath = path.join(__dirname, '../recovered_files', safeFilename);

        if (!(await fs.pathExists(filePath))) {
            return res.status(404).json({ error: 'Recovered file not found in quarantine dump.' });
        }

        res.download(filePath, safeFilename);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
