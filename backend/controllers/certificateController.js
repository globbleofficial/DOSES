const Certificate = require('../models/Certificate');

exports.verifyCertificate = async (req, res) => {
    try {
        const { idOrHash } = req.params;
        let cert = null;
        try {
            cert = await Certificate.findOne({
                $or: [{ certificateId: idOrHash }, { verificationHash: idOrHash }]
            });
        } catch (e) {}

        if (!cert) {
            return res.status(404).json({
                verified: false,
                message: 'No certificate matching this ID or cryptographic hash found.'
            });
        }

        res.json({
            verified: true,
            certificate: cert
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.listCertificates = async (req, res) => {
    try {
        let certs = [];
        try {
            certs = await Certificate.find().sort({ createdAt: -1 }).limit(50);
        } catch (e) {}
        res.json({ success: true, certificates: certs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
