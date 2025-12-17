import { StandardCheckoutClient, Env } from 'pg-sdk-node';

// Function to get the initialized client
export function getPhonePeClient() {
    const clientId = (process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID || '').trim();
    const clientSecret = (process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY || '').trim();
    const clientVersion = parseInt((process.env.PHONEPE_CLIENT_VERSION || '1').trim());
    const envStr = (process.env.PHONEPE_ENV || 'SANDBOX').trim().toUpperCase();

    // Explicitly cast envStr to Env enum if needed or pass as string if SDK allows
    const env = envStr === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

    if (!clientId || !clientSecret) {
        throw new Error('PhonePe Client ID or Secret is missing in environment variables');
    }

    // Initialize Singleton Client
    return StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
}
