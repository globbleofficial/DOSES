const transporter = require('../config/mailer');
const logger = require('../utils/logger');

class EmailService {
    async sendSanitizationCertificate(recipientEmail, certificate) {
        if (!transporter) {
            logger.info(`[Email Service Mock] Certificate ${certificate.certificateId} ready for ${recipientEmail}`);
            return { sent: false, reason: 'SMTP not configured in .env' };
        }

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }
                .card { max-width: 600px; margin: 0 auto; background: #131b2e; border: 1px solid #00f0ff; border-radius: 8px; overflow: hidden; }
                .header { background: linear-gradient(135deg, #0052cc 0%, #00f0ff 100%); padding: 20px; text-align: center; color: white; }
                .body { padding: 24px; }
                .badge { display: inline-block; background: #00f0ff22; color: #00f0ff; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-bottom: 12px; }
                .row { display: flex; justify-content: space-between; border-bottom: 1px solid #1e293b; padding: 8px 0; font-size: 14px; }
                .label { color: #94a3b8; }
                .val { font-family: monospace; color: #38bdf8; font-weight: bold; }
                .hash-box { background: #070a12; border: 1px solid #334155; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 11px; color: #4ade80; margin-top: 15px; }
                .footer { text-align: center; font-size: 11px; color: #64748b; padding: 15px; border-top: 1px solid #1e293b; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h2 style="margin:0;">SECUREWIPE PRO</h2>
                    <p style="margin:4px 0 0 0; font-size: 13px;">Official Certificate of Cryptographic Data Destruction</p>
                </div>
                <div class="body">
                    <span class="badge">BLOCKCHAIN VERIFIED</span>
                    <p>This certifies that the target storage media has undergone complete physical sanitization in accordance with DoD / NIST standards.</p>
                    
                    <div class="row"><span class="label">Certificate ID:</span><span class="val">${certificate.certificateId}</span></div>
                    <div class="row"><span class="label">Target Media:</span><span class="val">${certificate.targetIdentifier}</span></div>
                    <div class="row"><span class="label">Device Specs:</span><span class="val">${certificate.deviceType} (${certificate.deviceSize})</span></div>
                    <div class="row"><span class="label">Algorithm:</span><span class="val">${certificate.wipeMethod} (${certificate.passes} Passes)</span></div>
                    <div class="row"><span class="label">Blockchain Network:</span><span class="val">${certificate.network}</span></div>
                    <div class="row"><span class="label">Block Number:</span><span class="val">#${certificate.blockNumber}</span></div>

                    <div style="margin-top:15px; font-size:12px; color:#94a3b8;">Cryptographic Verification Hash:</div>
                    <div class="hash-box">${certificate.verificationHash}</div>
                </div>
                <div class="footer">
                    Secured by SecureWipe Pro Enterprise Sanitization Protocol. Data recovery is physically impossible.
                </div>
            </div>
        </body>
        </html>
        `;

        try {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || '"SecureWipe Pro" <no-reply@securewipe.io>',
                to: recipientEmail,
                subject: `🔒 Data Sanitization Certificate: ${certificate.certificateId}`,
                html
            });
            logger.info(`Certificate email sent to ${recipientEmail}: ${info.messageId}`);
            return { sent: true, messageId: info.messageId };
        } catch (err) {
            logger.error(`Failed to send email to ${recipientEmail}:`, err);
            return { sent: false, error: err.message };
        }
    }
}

module.exports = new EmailService();
