import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { txnId, txnDate, userId } = body;

        const key = process.env.UPIGATEWAY_KEY;

        if (!key || !txnId || !txnDate) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Call Ekqr Check Order Status API
        const payload = {
            key: key,
            client_txn_id: txnId,
            txn_date: txnDate
        };

        const response = await fetch('https://api.ekqr.in/api/check_order_status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Check if transaction was successful
        if (data.status === true && data.data?.status === 'success') {
            const transactionValues = data.data;
            const planId = transactionValues.udf1; // We stored planId in udf1
            // const checkUserId = transactionValues.udf2; // We stored userId in udf2

            if (userId && planId) {
                const userRef = doc(db, 'users', userId);

                const now = new Date();
                let expiryDate = new Date();
                if (planId === '1_year') expiryDate.setFullYear(now.getFullYear() + 1);
                else if (planId === '6_months') expiryDate.setMonth(now.getMonth() + 6);
                else if (planId === '3_months') expiryDate.setMonth(now.getMonth() + 3);

                await updateDoc(userRef, {
                    subscription_tier: 'premium',
                    subscription_plan: planId,
                    subscription_expiry: Timestamp.fromDate(expiryDate),
                    payment_history: arrayUnion({
                        order_id: transactionValues.id ? String(transactionValues.id) : 'unknown',
                        payment_id: txnId,
                        amount: Number(transactionValues.amount),
                        date: Timestamp.now(),
                        plan: planId,
                        provider: 'ekqr',
                        status: 'success'
                    })
                });

                return NextResponse.json({ success: true, message: 'Payment verified and profile updated' });
            }
            return NextResponse.json({ error: 'Invalid user or plan data in transaction' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Payment not successful or not found' }, { status: 400 });

    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
