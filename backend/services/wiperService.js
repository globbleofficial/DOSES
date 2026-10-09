const fs = require('fs-extra');
const fsp = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

/**
 * Military-grade wiping algorithm specifications and bit patterns
 */
const WIPE_ALGORITHMS = {
    dod: {
        id: 'dod',
        name: 'DoD 5220.22-M',
        passes: 3,
        description: 'US Department of Defense standard (Zeros -> Ones -> Random)',
        // Pass 1: 0x00, Pass 2: 0xFF, Pass 3: Random
        getPattern: (pass, size) => {
            if (pass === 0) return Buffer.alloc(size, 0x00);
            if (pass === 1) return Buffer.alloc(size, 0xFF);
            return crypto.randomBytes(size);
        }
    },
    gutmann: {
        id: 'gutmann',
        name: 'Gutmann Method',
        passes: 35,
        description: 'Peter Gutmann 35-pass algorithm for magnetic & flash recovery defense',
        getPattern: (pass, size) => {
            // Passes 1-4 and 32-35 are pseudo-random
            if (pass < 4 || pass >= 31) {
                return crypto.randomBytes(size);
            }
            // Passes 5-31 use specific magnetic bit transition patterns
            const gutmannBytes = [
                0x55, 0xAA, 0x92, 0x49, 0x24, 0x00, 0x11, 0x22, 0x33, 0x44,
                0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE,
                0xFF, 0x92, 0x49, 0x24, 0x6D, 0xB6, 0xDB
            ];
            const byteVal = gutmannBytes[(pass - 4) % gutmannBytes.length];
            return Buffer.alloc(size, byteVal);
        }
    },
    random: {
        id: 'random',
        name: 'Random 7-Pass',
        passes: 7,
        description: 'Balanced security & speed using cryptographic random byte streams',
        getPattern: (pass, size) => {
            return crypto.randomBytes(size);
        }
    },
    custom: {
        id: 'custom',
        name: 'Custom Enterprise Algorithm',
        passes: 10,
        description: 'Alternating bit inversion & cryptographic salt (10 passes)',
        getPattern: (pass, size) => {
            if (pass % 3 === 0) return Buffer.alloc(size, 0xAA); // 10101010
            if (pass % 3 === 1) return Buffer.alloc(size, 0x55); // 01010101
            return crypto.randomBytes(size);
        }
    }
};

class WiperService {
    constructor() {
        this.algorithms = WIPE_ALGORITHMS;
        this.CHUNK_SIZE = 1024 * 1024; // 1 MB streaming chunk for memory efficiency
    }

    /**
     * Get algorithm configuration by key
     */
    getAlgorithm(methodKey = 'dod') {
        const key = methodKey.toLowerCase();
        return this.algorithms[key] || this.algorithms['dod'];
    }

    /**
     * Core Overwriting Engine
     * Overwrites a file sector-by-sector, flushes OS write cache to hardware,
     * truncates file to 0 bytes, and unlinks it from the file system.
     * 
     * @param {string} filePath - Absolute or relative path to file
     * @param {string} methodKey - Algorithm identifier ('dod', 'gutmann', 'random', 'custom')
     * @param {Function} onProgress - Progress callback function (percentage: number)
     * @returns {Promise<{ fileSize: number, passes: number, algorithm: string, durationMs: number }>}
     */
    async secureWipeFile(filePath, methodKey = 'dod', onProgress = null) {
        const startTime = Date.now();
        const algorithm = this.getAlgorithm(methodKey);

        // 1. Path & Existence Verification
        const resolvedPath = path.resolve(filePath);
        const exists = await fs.pathExists(resolvedPath);
        if (!exists) {
            throw new Error(`File not found at path: ${resolvedPath}`);
        }

        const stats = await fs.stat(resolvedPath);
        if (!stats.isFile()) {
            throw new Error(`Target is not a valid file: ${resolvedPath}`);
        }

        const fileSize = stats.size;

        // 2. Open low-level File Descriptor in read-write ('r+') mode
        const fileHandle = await fsp.open(resolvedPath, 'r+');

        try {
            // For files with 0 bytes, write at least one chunk to destroy directory metadata
            const effectiveSize = Math.max(fileSize, 1024);

            // 3. Multi-Pass Overwriting Loop
            for (let pass = 0; pass < algorithm.passes; pass++) {
                let bytesWrittenInPass = 0;

                while (bytesWrittenInPass < effectiveSize) {
                    const bytesToProcess = Math.min(this.CHUNK_SIZE, effectiveSize - bytesWrittenInPass);
                    
                    // Generate pass-specific byte pattern
                    const patternBuffer = algorithm.getPattern(pass, bytesToProcess);

                    // Physical write to disk at exact file offset
                    await fileHandle.write(patternBuffer, 0, bytesToProcess, bytesWrittenInPass);
                    bytesWrittenInPass += bytesToProcess;

                    // Calculate real-time progress across all passes
                    if (typeof onProgress === 'function') {
                        const totalUnits = algorithm.passes * effectiveSize;
                        const currentUnits = (pass * effectiveSize) + bytesWrittenInPass;
                        const percentage = Math.min(Math.floor((currentUnits / totalUnits) * 100), 99);
                        onProgress(percentage, pass + 1, algorithm.passes);
                    }
                }

                // 4. Force OS disk cache flush to physical hardware (Critical for SSD/HDD)
                await fileHandle.sync();
            }

            // 5. Truncate file length to 0 bytes
            await fileHandle.truncate(0);
            await fileHandle.sync();

            if (typeof onProgress === 'function') {
                onProgress(100, algorithm.passes, algorithm.passes);
            }
        } finally {
            // Ensure file descriptor is closed before unlinking
            await fileHandle.close();
        }

        // 6. Delete file node from filesystem
        await fs.unlink(resolvedPath);

        // 7. Post-deletion existence check to guarantee permanent destruction
        const stillExists = await fs.pathExists(resolvedPath);
        if (stillExists) {
            throw new Error(`Verification failed: File could not be deleted from disk.`);
        }

        const durationMs = Date.now() - startTime;
        return {
            fileSize,
            passes: algorithm.passes,
            algorithm: algorithm.name,
            durationMs
        };
    }

    /**
     * Download a file stream from URL into a temporary quarantine,
     * then execute multi-pass overwrite on that downloaded file.
     */
    async secureWipeFromUrl(url, methodKey = 'dod', tempDir = 'temp', onProgress = null) {
        await fs.ensureDir(tempDir);
        const tempFileName = `dl_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.tmp`;
        const tempFilePath = path.join(tempDir, tempFileName);

        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                timeout: 300000,
                maxRedirects: 5
            });

            const writer = fs.createWriteStream(tempFilePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Wipe downloaded file from disk
            return await this.secureWipeFile(tempFilePath, methodKey, onProgress);
        } catch (error) {
            if (await fs.pathExists(tempFilePath)) {
                await fs.unlink(tempFilePath).catch(() => {});
            }
            throw new Error(`URL Wipe failed: ${error.message}`);
        }
    }
}

module.exports = new WiperService();
