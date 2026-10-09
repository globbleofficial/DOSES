const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const os = require('os');
const wiperService = require('../services/wiperService');
const hashService = require('../services/hashService');
const blockchainService = require('../services/blockchainService');
const emailService = require('../services/emailService');
const salesforceService = require('../services/salesforceService');
const Certificate = require('../models/Certificate');
const WipeLog = require('../models/WipeLog');
const logger = require('../utils/logger');

/**
 * Check if the backend process is running with elevated / Administrator privileges
 */
exports.checkAdminPrivileges = async (req, res) => {
    const platform = os.platform();
    let isAdmin = false;

    try {
        if (platform === 'win32') {
            // "net session" or "fsutil dirty query %systemdrive%" only succeeds with Administrator privileges
            try {
                await execPromise('net session');
                isAdmin = true;
            } catch {
                isAdmin = false;
            }
        } else {
            // Linux / macOS root check (UID 0)
            isAdmin = process.getuid ? process.getuid() === 0 : false;
        }
    } catch {
        isAdmin = false;
    }

    res.json({
        platform,
        isAdmin,
        message: isAdmin 
            ? 'Process running with elevated Administrator privileges.' 
            : 'Standard user privileges. To wipe system-protected files, launch Node.js / terminal using "Run as Administrator".'
    });
};

/**
 * Browse local file system directories on the host PC
 * Allows user to visually explore C:, D:, E:, etc. and pick files to wipe
 */
exports.browseLocalDirectory = async (req, res) => {
    try {
        let targetPath = req.body.dirPath || '';
        const platform = os.platform();

        // If no path specified, list root drives (Windows) or root / (Linux/Mac)
        if (!targetPath) {
            if (platform === 'win32') {
                // List Windows drive letters
                try {
                    const { stdout } = await execPromise('powershell -NoProfile -Command "Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Root"');
                    const roots = stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
                    return res.json({
                        currentPath: '',
                        isRoot: true,
                        items: roots.map(r => ({ name: r, path: r, isDirectory: true, isDrive: true }))
                    });
                } catch {
                    return res.json({
                        currentPath: '',
                        isRoot: true,
                        items: [
                            { name: 'C:\\', path: 'C:\\', isDirectory: true, isDrive: true },
                            { name: 'D:\\', path: 'D:\\', isDirectory: true, isDrive: true }
                        ]
                    });
                }
            } else {
                targetPath = '/';
            }
        }

        const normalizedPath = path.resolve(targetPath);
        if (!(await fs.pathExists(normalizedPath))) {
            return res.status(404).json({ error: `Directory path not found: ${normalizedPath}` });
        }

        const stats = await fs.stat(normalizedPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({ error: `Target path is not a directory: ${normalizedPath}` });
        }

        const entries = await fs.readdir(normalizedPath, { withFileTypes: true });
        const items = [];

        for (const entry of entries) {
            // Hide system noise
            if (entry.name.startsWith('$') || entry.name === 'System Volume Information') continue;

            const fullItemPath = path.join(normalizedPath, entry.name);
            items.push({
                name: entry.name,
                path: fullItemPath,
                isDirectory: entry.isDirectory(),
                isDrive: false
            });
        }

        // Sort folders first, then files alphabetically
        items.sort((a, b) => {
            if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
            return a.isDirectory ? -1 : 1;
        });

        const parentPath = path.dirname(normalizedPath);
        const hasParent = parentPath !== normalizedPath;

        res.json({
            currentPath: normalizedPath,
            parentPath: hasParent ? parentPath : null,
            isRoot: false,
            items: items.slice(0, 200) // cap at 200 items for performance
        });

    } catch (error) {
        logger.error('[Browse Local Error]:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Wipes a real local file on the user's PC using direct path (e.g. "D:\photo.jpg")
 */
exports.wipeLocalFile = async (req, res) => {
    try {
        const {
            filePath,
            wipeMethod = 'dod',
            recipientEmail,
            deviceType,
            deviceSize
        } = req.body;

        if (!filePath) {
            return res.status(400).json({ error: 'Local file path is required (e.g. D:\\photo.jpg)' });
        }

        const cleanedPath = filePath.trim().replace(/^["']|["']$/g, '');
        const resolvedPath = path.resolve(cleanedPath);

        logger.info(`[Local File Purge] Target requested: ${resolvedPath} with method: ${wipeMethod}`);

        // 1. Verify existence on physical storage
        if (!(await fs.pathExists(resolvedPath))) {
            return res.status(404).json({
                error: 'File not found on local disk',
                details: `The path "${resolvedPath}" does not exist on your computer. Please check the drive letter and file name.`
            });
        }

        const fileStat = await fs.stat(resolvedPath);
        if (!fileStat.isFile()) {
            return res.status(400).json({ error: 'Target path is a directory, not a file' });
        }

        const fileName = path.basename(resolvedPath);
        const fileSize = fileStat.size;

        // Remove read-only / hidden attributes if set (Windows & Linux)
        try {
            await fs.chmod(resolvedPath, 0o666);
            if (os.platform() === 'win32') {
                await execPromise(`attrib -R -H "${resolvedPath}"`);
            }
        } catch {}

        // 2. Execute low-level bit-by-bit physical sector overwriting
        const wipeResult = await wiperService.secureWipeFile(resolvedPath, wipeMethod);

        // 3. Confirm file is permanently deleted from host PC
        const stillExists = await fs.pathExists(resolvedPath);
        if (stillExists) {
            throw new Error(`File lock error: File could not be unlinked from disk. Make sure the file is closed in other applications and run as Administrator.`);
        }

        // 4. Generate Verification Hash & Post-Quantum Proof
        const verificationHash = hashService.generateVerificationHash(fileName, wipeMethod);
        const certId = hashService.generateCertificateId();

        // 5. Blockchain Anchor
        const anchor = await blockchainService.anchorCertificate({
            certificateId: certId,
            verificationHash
        });

        // 6. Salesforce ITAM Sync
        const salesforceSync = await salesforceService.syncDeviceSanitization({
            serialNumber: `PC-FILE-${Buffer.from(fileName).toString('hex').substring(0, 16).toUpperCase()}`,
            driveLetter: path.parse(resolvedPath).root || 'LOCAL_PC',
            deviceModel: 'Host Workstation Storage',
            deviceSize: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
            wipeMethod: wipeResult.algorithm,
            passes: wipeResult.passes,
            verificationHash,
            certificateId: certId,
            transactionHash: anchor.transactionHash,
            operatorEmail: recipientEmail || 'operator@doses.io'
        });

        const certPayload = {
            certificateId: certId,
            userName: req.user ? req.user.name : 'Authorized PC Operator',
            recipientEmail: recipientEmail || (req.user ? req.user.email : 'operator@doses.io'),
            targetType: 'LOCAL_PC_FILE',
            targetIdentifier: resolvedPath,
            deviceType: deviceType || 'Local Physical Storage Drive',
            deviceSize: deviceSize || `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
            wipeMethod: wipeResult.algorithm,
            passes: wipeResult.passes,
            verificationHash,
            transactionHash: anchor.transactionHash,
            blockNumber: anchor.blockNumber,
            network: anchor.network,
            status: anchor.status,
            salesforceAssetId: salesforceSync.salesforceAssetId,
            salesforceCaseId: salesforceSync.salesforceCaseId,
            salesforceSyncStatus: 'SYNCED',
            salesforceSyncTimestamp: new Date()
        };

        // Persist to MongoDB
        try {
            await Certificate.create(certPayload);
            await WipeLog.create({
                operationType: 'LOCAL_PATH_WIPE',
                targetName: resolvedPath,
                algorithm: wipeMethod,
                passes: wipeResult.passes,
                status: 'completed',
                verificationHash,
                certificateId: certId,
                durationSeconds: Math.floor(wipeResult.durationMs / 1000)
            });
        } catch (dbErr) {
            logger.warn(`Database log notice: ${dbErr.message}`);
        }

        // Email delivery
        await emailService.sendSanitizationCertificate(certPayload.recipientEmail, certPayload);

        res.json({
            success: true,
            message: `File "${resolvedPath}" was physically overwritten on your hard drive and permanently destroyed.`,
            fileName,
            fullPath: resolvedPath,
            fileSizeFormatted: `${(fileSize / 1024).toFixed(2)} KB`,
            passes: wipeResult.passes,
            algorithm: wipeResult.algorithm,
            certificate: certPayload,
            salesforceSync
        });

    } catch (error) {
        logger.error('[Local File Wipe Error]:', error);
        res.status(500).json({ error: error.message, details: error.stack });
    }
};

exports.wipeUploadedFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded for secure deletion' });
        }

        const { wipeMethod = 'dod', recipientEmail, deviceType, deviceSize } = req.body;
        const filePath = req.file.path;
        const originalName = req.file.originalname;

        const wipeResult = await wiperService.secureWipeFile(filePath, wipeMethod);
        const verificationHash = hashService.generateVerificationHash(originalName, wipeMethod);
        const certId = hashService.generateCertificateId();

        const anchor = await blockchainService.anchorCertificate({
            certificateId: certId,
            verificationHash
        });

        const certPayload = {
            certificateId: certId,
            userName: req.user ? req.user.name : 'System Operator',
            recipientEmail: recipientEmail || (req.user ? req.user.email : 'operator@local'),
            targetType: 'FILE',
            targetIdentifier: originalName,
            deviceType: deviceType || 'Host Storage',
            deviceSize: deviceSize || `${(wipeResult.fileSize / 1024 / 1024).toFixed(2)} MB`,
            wipeMethod: wipeResult.algorithm,
            passes: wipeResult.passes,
            verificationHash,
            transactionHash: anchor.transactionHash,
            blockNumber: anchor.blockNumber,
            network: anchor.network,
            status: anchor.status
        };

        try {
            await Certificate.create(certPayload);
            await WipeLog.create({
                operationType: 'UPLOAD_WIPE',
                targetName: originalName,
                algorithm: wipeMethod,
                passes: wipeResult.passes,
                status: 'completed',
                verificationHash,
                certificateId: certId,
                durationSeconds: Math.floor(wipeResult.durationMs / 1000)
            });
        } catch (dbErr) {}

        await emailService.sendSanitizationCertificate(certPayload.recipientEmail, certPayload);

        res.json({
            success: true,
            fileName: originalName,
            certificate: certPayload
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.wipeUrl = async (req, res) => {
    try {
        const { url, wipeMethod = 'dod', recipientEmail } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const result = await wiperService.secureWipeFromUrl(url, wipeMethod);
        const verificationHash = hashService.generateVerificationHash(url, wipeMethod);
        const certId = hashService.generateCertificateId();
        const anchor = await blockchainService.anchorCertificate({ certificateId: certId, verificationHash });

        const certPayload = {
            certificateId: certId,
            userName: req.user ? req.user.name : 'System Operator',
            recipientEmail: recipientEmail || 'operator@local',
            targetType: 'URL',
            targetIdentifier: url,
            deviceType: 'Remote Web Endpoint',
            deviceSize: `${(result.fileSize / 1024).toFixed(2)} KB`,
            wipeMethod: result.algorithm,
            passes: result.passes,
            verificationHash,
            transactionHash: anchor.transactionHash,
            blockNumber: anchor.blockNumber,
            network: anchor.network,
            status: anchor.status
        };

        res.json({ success: true, certificate: certPayload });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
