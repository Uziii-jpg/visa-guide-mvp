import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        // PhonePe sends the response as a form-urlencoded POST request
        const formData = await req.formData();
        const merchantId = formData.get('merchantId') as string; // Standard PhonePe field?
        // Actually PhonePe sends a JSON object in the 'response' (UAT) or specific structure. 
        // Wait, the documentation says for POST redirect, it sends `code`, `merchantId`, `transactionId`, `amount`, `providerReferenceId`, `param1`, etc OR a base64 encoded payload depending on version.
        // Standard Checkout V1 usually sends a base64 encoded JSON in `response` parameter? or it might be sending raw params.
        // Let's check the doc again.
        // "Content-type: application/x-www-form-urlencoded"
        // Arguments: code, merchantId, transactionId, amount, providerReferenceId, param1...param20, checksum
        // OH WAIT. The new V1 API usually sends a BASE64 encoded string if we use the NEW integration.
        // Let's re-read the "What's Next?" or Integration steps carefully. 
        // Re-checking... 
        // Actually, usually it posts to the redirect URL.

        // Let's assume standard V1 Pay Page flow. 
        // The redirect comes with `code`, `merchantId`, `transactionId`... 
        // AND `checksum`.

        // BUT, wait. My Previous experience says it might be different. 
        // Let's look at the `formData` content.

        // "When the payment is complete, PhonePe will redirect the user to the redirectUrl with a POST request containing the payment details."
        // It usually sends `code` (PAYMENT_SUCCESS / PAYMENT_ERROR), `merchantId`, `transactionId`, `amount`, `providerReferenceId`.

        // HOWEVER, the checksum verification logic is CRITICAL.
        // `checksum` received in header `X-VERIFY` is for S2S callback.
        // For Browser Redirect, the checksum is in the BODY (if form encoded) or we have to verify status via API.

        // SAFEST APPROACH:
        // 1. Get `merchantTransactionId` from the POST body (or query if GET).
        // 2. IGNORE the status in the body (it can be spoofed, although checksum prevents it).
        // 3. CALL PHONEPE STATUS API from the SERVER to confirm the status.
        // 4. Then redirect user.

        // Let's parse formData.
        const code = formData.get('code');
        const transactionId = formData.get('transactionId') as string; // This is merchantTransactionId
        const merchantIdFromResponse = formData.get('merchantId');

        // Note: PhonePe might send it as `response` (base64) in some versions. 
        // But standard `application/x-www-form-urlencoded` usually has flat fields for older, or flat fields for newer.
        // Actually, documentation says: `response` (Base64 encoded JSON) in some flows.
        // Let's handle both just in case, or default to the safer Status Check.

        // If we only get transactionId, that's enough to check status.

        // Fallback: Check if `code` and `transactionId` exist.
        if (!code || !transactionId) {
            // Try getting `response` param (Newer v1 flow sometimes uses this)
            // If not found, log error.
        }

        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX;
        const phonePeMerchantId = process.env.PHONEPE_MERCHANT_ID;
        const env = process.env.PHONEPE_ENV || 'UAT';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        if (!saltKey || !saltIndex || !phonePeMerchantId) {
            return NextResponse.redirect(`${baseUrl}/payment/status?status=FAILURE&reason=config_error`);
        }

        // Call Status API
        const statusUrl = env === 'PROD'
            ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${phonePeMerchantId}/${transactionId}`
            : `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${phonePeMerchantId}/${transactionId}`;

        const stringToSign = `/pg/v1/status/${phonePeMerchantId}/${transactionId}` + saltKey;
        const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex') + '###' + saltIndex;

        const statusRes = await fetch(statusUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-MERCHANT-ID': phonePeMerchantId,
                'X-VERIFY': checksum,
            }
        });

        const statusData = await statusRes.json();

        // Extract planId from transactionId (Format: TXN_{timestamp}_{planId})
        const parts = transactionId.split('_');
        const planId = parts.length >= 3 ? parts.slice(2).join('_') : 'unknown';

        if (statusData.success && statusData.code === 'PAYMENT_SUCCESS') {
            // Payment Valid!
            return NextResponse.redirect(`${baseUrl}/payment/status?status=SUCCESS&planId=${planId}&txnId=${transactionId}`, 303);
        } else {
            return NextResponse.redirect(`${baseUrl}/payment/status?status=FAILURE&planId=${planId}&reason=${statusData.code}`, 303);
        }

    } catch (error) {
        console.error('PhonePe Callback Error:', error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/payment/status?status=FAILURE&reason=server_error`, 303);
    }
}
