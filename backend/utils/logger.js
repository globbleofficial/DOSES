const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const logger = {
    info: (message, meta = '') => {
        const line = `[${getTimestamp()}] [INFO] ${message} ${meta ? JSON.stringify(meta) : ''}\n`;
        process.stdout.write(line);
        fs.appendFileSync(path.join(logDir, 'app.log'), line);
    },
    warn: (message, meta = '') => {
        const line = `[${getTimestamp()}] [WARN] ${message} ${meta ? JSON.stringify(meta) : ''}\n`;
        process.stdout.write(line);
        fs.appendFileSync(path.join(logDir, 'app.log'), line);
    },
    error: (message, error = '') => {
        const line = `[${getTimestamp()}] [ERROR] ${message} ${error.stack || error}\n`;
        process.stderr.write(line);
        fs.appendFileSync(path.join(logDir, 'error.log'), line);
    }
};

module.exports = logger;
