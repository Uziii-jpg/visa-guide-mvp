import { StandardCheckoutClient, Env } from 'pg-sdk-node';

// Function to get the initialized client
export function getPhonePeClient() {
    let clientId = (process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID || '').trim();
    let clientSecret = (process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY || '').trim();
    const clientVersion = parseInt((process.env.PHONEPE_CLIENT_VERSION || '1').trim());
    const envStr = (process.env.PHONEPE_ENV || 'SANDBOX').trim().toUpperCase();

    // Fallback to Sandbox Keys for Local Development ONLY
    if ((!clientId || !clientSecret) && process.env.NODE_ENV !== 'production') {
        console.log('Using Default Sandbox Credentials for Development');
        clientId = 'PGTESTPAYUAT';
        clientSecret = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    }

    const env = envStr === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

    if (!clientId || !clientSecret) {
        throw new Error('PhonePe Client ID or Secret is missing in environment variables');
    }

    // Initialize Singleton Client
    return StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
}
