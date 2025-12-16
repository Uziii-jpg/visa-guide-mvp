import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { planId, userId } = await req.json();

        if (!planId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const merchantId = process.env.PHONEPE_MERCHANT_ID;
        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX;
        const env = process.env.PHONEPE_ENV || 'UAT';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        if (!merchantId || !saltKey || !saltIndex || !baseUrl) {
            console.error('PhonePe configuration missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const merchantTransactionId = `TXN_${Date.now()}_${planId}`;

        // Amount in paise (100 paise = 1 INR)
        const PLANS: Record<string, number> = {
            '1_year': 250,
            '6_months': 150,
            '3_months': 100,
        };

        const amount = PLANS[planId] * 100;

        if (!amount) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const callbackUrl = `${baseUrl}/api/payment/phonepe/callback`;
        // const redirectUrl = `${baseUrl}/api/payment/phonepe/callback`; // We can use the same for redirect to handle the POST return

        const data = {
            merchantId: merchantId,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: userId,
            amount: amount,
            redirectUrl: callbackUrl,
            redirectMode: 'POST',
            callbackUrl: callbackUrl, // S2S callback
            mobileNumber: '9999999999', // Optional: Get from user profile if available
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const stringToSign = payloadMain + '/pg/v1/pay' + saltKey;
        const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex') + '###' + saltIndex;

        const phonePeUrl = env === 'PROD'
            ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
            : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

        const response = await fetch(phonePeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'accept': 'application/json'
            },
            body: JSON.stringify({
                request: payloadMain
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            return NextResponse.json({
                url: responseData.data.instrumentResponse.redirectInfo.url,
                merchantTransactionId
            });
        } else {
            console.error('PhonePe Init Error:', responseData);
            return NextResponse.json({ error: responseData.message || 'Payment initiation failed' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error initiating PhonePe payment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
