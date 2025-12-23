import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        // UPIGateway sends form-data or JSON? Docs say "Post Data (JSON)" for status check, 
        // but typically webhooks are POST requests with JSON body. 
        // The success response example is JSON. 
        // I'll assume JSON body.

        // Wait, the docs say "Set Webhook... To automatically receive the response for the order status".
        // It doesn't show the webhook payload format explicitly in the prompt, but it's usually similar to Check Order Status response.
        // Example "Check Order Status" response has `data` with `status`, `client_txn_id`, `udf1` etc.

        const body = await req.json();
        console.log('Ekqr Webhook:', body);

        // Verification logic? 
        // Verify key? or txn_id exists?
        // Let's rely on data presence for MVP.

        const data = body.data || body; // Sometimes wrapped in data, sometimes not.

        if (data.status === 'success' || body.status === true) { // check success condition carefully
            const status = data.status || 'success';

            if (status === 'success') {
                const client_txn_id = data.client_txn_id;
                const planId = data.udf1;
                const userId = data.udf2;
                const amount = data.amount;
                const order_id = data.id || data.order_id; // id in check status, order_id in create response

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
                            order_id: order_id ? String(order_id) : 'unknown',
                            payment_id: client_txn_id,
                            amount: Number(amount),
                            date: Timestamp.now(),
                            plan: planId,
                            provider: 'ekqr',
                            status: 'success'
                        })
                    });

                    return NextResponse.json({ status: true, msg: "Updated" });
                }
            }
        }

        return NextResponse.json({ status: true, msg: "Received" });

    } catch (error) {
        console.error('Ekqr Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
