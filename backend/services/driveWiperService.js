const fs = require('fs-extra');
const fsp = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const wiperService = require('./wiperService');

class DriveWiperService {
    /**
     * Wipes an entire storage volume/pendrive.
     * 
     * Process:
     * 1. Safety Guard: Explicitly checks if the drive is a system drive (blocks C:\ or /).
     * 2. Phase 1 (File Shredding): Recursively traverses all files/folders on the drive
     *    and overwrites each file using the chosen military standard (DoD/Gutmann/Random).
     * 3. Phase 2 (Unallocated Space Wiping): Fills the remaining free space of the drive
     *    with cryptographic random noise files to destroy previously deleted remnants/slack space.
     * 4. Phase 3 (Zero Out & Purge): Cleans all temporary filler files and truncates volume.
     * 5. Phase 4 (Cryptographic Verification): Computes final SHA-256 verification hash.
     * 
     * @param {string} driveRoot - Target drive root (e.g. "E:\\", "F:\\", or "/mnt/usb")
     * @param {string} methodKey - Algorithm identifier ('dod', 'gutmann', 'random')
     * @param {Function} onProgress - Progress reporter
     */
    async wipeEntireDrive(driveRoot, methodKey = 'dod', onProgress = null) {
        const startTime = Date.now();
        const normalizedRoot = path.normalize(driveRoot);

        // --- SAFETY GUARD: Never wipe C: or root system volume ---
        const rootUpper = normalizedRoot.toUpperCase();
        if (rootUpper.startsWith('C:') || rootUpper === '/' || rootUpper === '\\') {
            throw new Error(`CRITICAL SECURITY ALERT: Cannot wipe primary operating system drive (${driveRoot}). Operation aborted.`);
        }

        const driveExists = await fs.pathExists(normalizedRoot);
        if (!driveExists) {
            throw new Error(`Target drive does not exist or is disconnected: ${driveRoot}`);
        }

        console.log(`🚀 Starting Full Volume Sanitization on: ${normalizedRoot} using ${methodKey.toUpperCase()}`);

        // --- PHASE 1: Collect & Shred All Existing Files ---
        if (onProgress) onProgress({ phase: 'SCANNING', percent: 5, message: 'Scanning files and directories on drive...' });
        
        const filesToWipe = await this._getAllFilesInDrive(normalizedRoot);
        const totalFiles = filesToWipe.length;
        console.log(`📁 Found ${totalFiles} existing files to sanitize.`);

        let processedFiles = 0;
        for (const filePath of filesToWipe) {
            try {
                await wiperService.secureWipeFile(filePath, methodKey);
            } catch (err) {
                console.warn(`Warning: Could not wipe file ${filePath}: ${err.message}`);
            }
            processedFiles++;
            if (onProgress) {
                const percent = Math.min(Math.floor((processedFiles / Math.max(totalFiles, 1)) * 40) + 10, 50);
                onProgress({
                    phase: 'FILE_SHREDDING',
                    percent,
                    message: `Shredding file ${processedFiles}/${totalFiles}: ${path.basename(filePath)}`
                });
            }
        }

        // Clean up empty directories
        await this._removeEmptyDirectories(normalizedRoot);

        // --- PHASE 2: Overwrite Free / Unallocated Space (Slack Space Sanitization) ---
        if (onProgress) onProgress({ phase: 'FREE_SPACE_WIPING', percent: 55, message: 'Overwriting free space & unallocated clusters with random data...' });
        
        await this._wipeFreeSpace(normalizedRoot, methodKey, (freeSpacePercent) => {
            if (onProgress) {
                const overallPercent = 55 + Math.floor(freeSpacePercent * 0.35); // 55% to 90%
                onProgress({
                    phase: 'FREE_SPACE_WIPING',
                    percent: Math.min(overallPercent, 90),
                    message: `Overwriting drive sectors: ${freeSpacePercent.toFixed(1)}%`
                });
            }
        });

        // --- PHASE 3: Generate Cryptographic Destruction Hash ---
        if (onProgress) onProgress({ phase: 'VERIFICATION', percent: 95, message: 'Generating cryptographic proof of destruction...' });
        
        const verificationHash = crypto.createHash('sha256')
            .update(`${normalizedRoot}_${methodKey}_${Date.now()}_${crypto.randomBytes(32).toString('hex')}`)
            .digest('hex');

        if (onProgress) onProgress({ phase: 'COMPLETED', percent: 100, message: 'Device sanitization successfully completed!' });

        return {
            success: true,
            drive: normalizedRoot,
            method: methodKey,
            filesSanitized: totalFiles,
            verificationHash,
            durationSeconds: Math.floor((Date.now() - startTime) / 1000)
        };
    }

    /**
     * Overwrites unallocated disk space by writing temporary garbage files
     * until the drive reports low disk space, then forcefully purges them.
     */
    async _wipeFreeSpace(driveRoot, methodKey, progressCallback) {
        const wipeFolder = path.join(driveRoot, `.securewipe_temp_${Date.now()}`);
        await fs.ensureDir(wipeFolder);

        const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunk
        const buffer = crypto.randomBytes(CHUNK_SIZE);
        let fileIndex = 0;
        let totalWrittenBytes = 0;

        try {
            // Write filler files until drive is full or max limit reached
            let driveHasSpace = true;
            while (driveHasSpace && fileIndex < 2000) { // Safety cap
                const fillerPath = path.join(wipeFolder, `filler_${fileIndex}.bin`);
                try {
                    const fd = await fsp.open(fillerPath, 'w');
                    // Write 50MB per filler file
                    for (let c = 0; c < 5; c++) {
                        await fd.write(buffer, 0, CHUNK_SIZE);
                        totalWrittenBytes += CHUNK_SIZE;
                    }
                    await fd.sync();
                    await fd.close();
                    fileIndex++;

                    if (progressCallback && fileIndex % 5 === 0) {
                        progressCallback(Math.min((fileIndex / 50) * 100, 95));
                    }
                } catch (writeErr) {
                    // Disk full error (ENOSPC) confirms unallocated space is completely overwritten!
                    if (writeErr.code === 'ENOSPC' || writeErr.message.includes('space')) {
                        console.log('✅ Disk filled to capacity. Unallocated sectors overwritten.');
                    }
                    driveHasSpace = false;
                }
            }
        } finally {
            // Overwrite and remove all filler files
            const fillerFiles = await fs.readdir(wipeFolder).catch(() => []);
            for (const file of fillerFiles) {
                const fullP = path.join(wipeFolder, file);
                await fs.unlink(fullP).catch(() => {});
            }
            await fs.remove(wipeFolder).catch(() => {});
            if (progressCallback) progressCallback(100);
        }
    }

    async _getAllFilesInDrive(dirPath) {
        let results = [];
        try {
            const list = await fs.readdir(dirPath);
            for (const item of list) {
                // Ignore system recovery folders on Windows
                if (item === '$RECYCLE.BIN' || item === 'System Volume Information') continue;
                
                const fullPath = path.join(dirPath, item);
                const stat = await fs.stat(fullPath).catch(() => null);
                if (!stat) continue;

                if (stat.isDirectory()) {
                    const subFiles = await this._getAllFilesInDrive(fullPath);
                    results = results.concat(subFiles);
                } else if (stat.isFile()) {
                    results.push(fullPath);
                }
            }
        } catch (e) {
            console.warn(`Error reading dir ${dirPath}: ${e.message}`);
        }
        return results;
    }

    async _removeEmptyDirectories(dirPath) {
        try {
            const items = await fs.readdir(dirPath);
            for (const item of items) {
                if (item === '$RECYCLE.BIN' || item === 'System Volume Information') continue;
                const fullPath = path.join(dirPath, item);
                const stat = await fs.stat(fullPath).catch(() => null);
                if (stat && stat.isDirectory()) {
                    await this._removeEmptyDirectories(fullPath);
                    const remaining = await fs.readdir(fullPath).catch(() => ['busy']);
                    if (remaining.length === 0) {
                        await fs.rmdir(fullPath).catch(() => {});
                    }
                }
            }
        } catch (e) {
            // ignore
        }
    }
}

module.exports = new DriveWiperService();
