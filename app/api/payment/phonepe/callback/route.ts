import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeClient } from '@/lib/phonepe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp, arrayUnion, getDoc } from 'firebase/firestore';

export async function GET(req: NextRequest) {
    return handleCallback(req);
}

export async function POST(req: NextRequest) {
    return handleCallback(req);
}

async function handleCallback(req: NextRequest) {
    try {
        let transactionId: string | null = null;
        let code: string | null = null;

        // Handle different request methods
        if (req.method === 'POST') {
            const formData = await req.formData();
            transactionId = formData.get('transactionId') as string || formData.get('merchantOrderId') as string;
            code = formData.get('code') as string;
        } else {
            const searchParams = req.nextUrl.searchParams;
            transactionId = searchParams.get('transactionId') || searchParams.get('merchantOrderId');
            code = searchParams.get('code');
        }


        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        // Default to 'en' as we removed it from query params
        const locale = req.nextUrl.searchParams.get('locale') || 'en';

        console.log('--- PHONEPE CALLBACK DEBUG ---');
        console.log('Method:', req.method);
        console.log('URL:', req.url);
        console.log('Txn ID:', transactionId);
        console.log('Code:', code);

        // Debug Headers
        const headersList: any = {};
        req.headers.forEach((val, key) => { headersList[key] = val; });
        console.log('Headers:', JSON.stringify(headersList));

        if (!transactionId) {
            console.error('Callback missing transactionId');
            // Try to extract from JSON body if it's there
            try {
                const json = await req.json();
                console.log('JSON Body:', json);
                if (json.transactionId) transactionId = json.transactionId;
                if (json.merchantOrderId) transactionId = json.merchantOrderId;
            } catch (e) {
                // Not JSON
            }

            if (!transactionId) {
                return NextResponse.redirect(`${baseUrl}/${locale}/payment/status?status=FAILURE&reason=missing_txn_id`, 303);
            }
        }

        const client = getPhonePeClient();

        // Parse metadata from transactionId: TXN__userId__planId__timestamp
        const parts = transactionId.split('__');
        if (parts.length < 4) {
            console.error('Invalid Transaction ID format:', transactionId);
            return NextResponse.redirect(`${baseUrl}/${locale}/payment/status?status=FAILURE&reason=invalid_txn_format`, 303);
        }

        const userId = parts[1];
        const planId = parts[2];

        // Verify status with PhonePe Server
        const statusResponse = await client.getOrderStatus(transactionId);

        console.log('Status Response:', statusResponse.state);

        if (statusResponse.state === 'COMPLETED') {
            // UPDATE FIRESTORE
            if (userId && planId) {
                try {
                    const userRef = doc(db, 'users', userId);

                    // Calcular duration
                    let monthsToAdd = 0;
                    if (planId === '1_year') monthsToAdd = 12;
                    if (planId === '6_months') monthsToAdd = 6;
                    if (planId === '3_months') monthsToAdd = 3;

                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + monthsToAdd);

                    await updateDoc(userRef, {
                        subscription_tier: 'premium', // Correct field used in types/user.ts
                        subscription_plan: planId,
                        // subscriptionStatus: 'active', // Not in User interface, skipping
                        // subscriptionStartDate: Timestamp.fromDate(startDate), // Not in User interface, skipping
                        subscription_expiry: Timestamp.fromDate(endDate), // Correct field 
                        payment_history: arrayUnion({
                            order_id: transactionId,
                            payment_id: transactionId, // PhonePe uses txnId as reference
                            amount: statusResponse.amount,
                            date: Timestamp.fromDate(new Date()),
                            plan: planId,
                            // status: 'SUCCESS', // Not in User interface
                            // provider: 'PHONEPE' // Not in User interface
                        })
                    });
                    console.log('User subscription updated:', userId);
                } catch (dbError) {
                    console.error('Firestore Update Error:', dbError);
                    // We still redirect to success, but log severe error
                }
            }

            return NextResponse.redirect(`${baseUrl}/${locale}/payment/status?status=SUCCESS&planId=${planId}&txnId=${transactionId}`, 303);
        } else {
            return NextResponse.redirect(`${baseUrl}/${locale}/payment/status?status=FAILURE&planId=${planId}&reason=${statusResponse.state}`, 303);
        }

    } catch (error: any) {
        console.error('PhonePe Callback Error:', error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const locale = req.nextUrl.searchParams.get('locale') || 'en'; // Ensure locale is available in catch block too if possible, defaulting to en
        return NextResponse.redirect(`${baseUrl}/${locale}/payment/status?status=FAILURE&reason=server_error`, 303);
    }
}
