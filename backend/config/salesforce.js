const axios = require('axios');
const logger = require('../utils/logger');

class SalesforceConfig {
    constructor() {
        this.loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';
        this.clientId = process.env.SALESFORCE_CLIENT_ID || '';
        this.clientSecret = process.env.SALESFORCE_CLIENT_SECRET || '';
        this.username = process.env.SALESFORCE_USERNAME || '';
        this.password = process.env.SALESFORCE_PASSWORD || '';
        this.securityToken = process.env.SALESFORCE_SECURITY_TOKEN || '';
        this.apiVersion = process.env.SALESFORCE_API_VERSION || 'v59.0';

        this.accessToken = null;
        this.instanceUrl = null;
        this.tokenExpiry = null;
        this.isConfigured = Boolean(this.clientId && this.clientSecret && this.username && this.password);

        if (this.isConfigured) {
            logger.info('[Salesforce Config] Enterprise Credentials present. Salesforce sync active.');
        } else {
            logger.info('[Salesforce Config] Running in Simulated Enterprise ITAM mode (Credentials empty in .env).');
        }
    }

    /**
     * Authenticates with Salesforce using OAuth 2.0 Username-Password Flow
     * Caches access token and auto-refreshes when expired.
     */
    async getAuthenticatedClient() {
        if (!this.isConfigured) {
            return null;
        }

        // Check if cached token is still valid
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return {
                instanceUrl: this.instanceUrl,
                accessToken: this.accessToken,
                apiVersion: this.apiVersion
            };
        }

        try {
            logger.info('[Salesforce Auth] Requesting OAuth 2.0 token from Salesforce identity provider...');
            const tokenEndpoint = `${this.loginUrl}/services/oauth2/token`;
            
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('client_id', this.clientId);
            params.append('client_secret', this.clientSecret);
            params.append('username', this.username);
            params.append('password', `${this.password}${this.securityToken}`);

            const response = await axios.post(tokenEndpoint, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            this.accessToken = response.data.access_token;
            this.instanceUrl = response.data.instance_url;
            // Cache token for 1 hour
            this.tokenExpiry = Date.now() + (3600 * 1000);

            logger.info(`[Salesforce Auth] Authentication successful! Instance URL: ${this.instanceUrl}`);
            return {
                instanceUrl: this.instanceUrl,
                accessToken: this.accessToken,
                apiVersion: this.apiVersion
            };
        } catch (error) {
            const errData = error.response ? error.response.data : error.message;
            logger.error('[Salesforce Auth Error] Failed to authenticate with Salesforce:', errData);
            throw new Error(`Salesforce authentication failed: ${JSON.stringify(errData)}`);
        }
    }
}

module.exports = new SalesforceConfig();
