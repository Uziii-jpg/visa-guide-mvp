import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeClient } from '@/lib/phonepe';
import { StandardCheckoutPayRequest } from 'pg-sdk-node';

export async function POST(req: NextRequest) {
    try {
        const { planId, userId, locale = 'en' } = await req.json();

        if (!planId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Amount in paise (100 paise = 1 INR)
        // Corrected prices to match SubscriptionPlans.tsx
        const PLANS: Record<string, number> = {
            '1_year': 250,
            '6_months': 125,
            '3_months': 100,
        };

        const amount = PLANS[planId] * 100;

        if (!amount) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Encode userId in transactionId: TXN__userId__planId__timestamp
        // Double underscore separator to avoid conflict with potential underscores in IDs
        const merchantTransactionId = `TXN__${userId}__${planId}__${Date.now()}`;

        const client = getPhonePeClient();
        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').trim();
        // Explicitly pass transactionId in URL because PhonePe Sandbox (or specific flow) doesn't always append it
        const callbackUrl = `${baseUrl}/api/payment/phonepe/callback?transactionId=${merchantTransactionId}&locale=${locale}`;

        // Create metadata following user's example if needed, but keeping it simple for now

        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantTransactionId)
            .amount(amount)
            .redirectUrl(callbackUrl)
            .build();

        console.log('--- PHONEPE SDK INITIATE ---');
        console.log('Order ID:', merchantTransactionId);
        console.log('Amount:', amount);
        console.log('Callback:', callbackUrl);

        const response = await client.pay(request);

        console.log('SDK Response:', response);

        // Map SDK response to our frontend expectation
        return NextResponse.json({
            url: response.redirectUrl,
            merchantTransactionId
        });

    } catch (error: any) {
        console.error('PhonePe SDK Error:', error);
        // SDK throws specific error object, try to extract msg
        return NextResponse.json({
            error: error.message || 'Payment initiation failed',
            details: error
        }, { status: 500 });
    }
}
