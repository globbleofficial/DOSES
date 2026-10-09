module.exports = {
    USER_ROLES: {
        ADMIN: 'admin',
        AUDITOR: 'auditor',
        OPERATOR: 'operator',
        USER: 'user'
    },
    SUBSCRIPTION_TIERS: {
        FREE: 'free',
        PRO: 'pro',
        ENTERPRISE: 'enterprise'
    },
    WIPE_STATUS: {
        PENDING: 'pending',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        FAILED: 'failed'
    },
    CERTIFICATE_STATUS: {
        CONFIRMED_ON_CHAIN: 'confirmed_on_chain',
        MOCK_RECORDED: 'mock_recorded',
        PENDING: 'pending'
    },
    SUPPORTED_ALGORITHMS: {
        dod: 'DoD 5220.22-M (3 Passes)',
        gutmann: 'Gutmann Method (35 Passes)',
        random: 'Random 7-Pass (7 Passes)',
        custom: 'Custom Enterprise (10 Passes)'
    }
};
