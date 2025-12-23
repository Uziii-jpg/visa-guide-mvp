import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp, arrayUnion, runTransaction } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const { paymentId, userId } = await req.json();

        if (!paymentId || !userId) {
            return NextResponse.json({ error: 'Missing paymentId or userId' }, { status: 400 });
        }

        const paymentRef = doc(db, 'payments', paymentId);
        const userRef = doc(db, 'users', userId);

        // Transaction to ensure atomicity (prevent double claiming)
        await runTransaction(db, async (transaction) => {
            const paymentDoc = await transaction.get(paymentRef);

            if (!paymentDoc.exists()) {
                throw new Error('Payment not found. Please wait a moment for the system to process specific payment.');
            }

            const paymentData = paymentDoc.data();

            if (paymentData.status !== 'captured') {
                throw new Error('Payment not successful.');
            }

            if (paymentData.claimed) {
                // If already claimed by THIS user, just return success (idempotent)
                if (paymentData.claimedBy === userId) {
                    return;
                }
                throw new Error('Payment already claimed.');
            }

            // Valid Claim
            const planId = paymentData.planId;

            // Calculate Expiry
            const now = new Date();
            let expiryDate = new Date();
            if (planId === '1_year') expiryDate.setFullYear(now.getFullYear() + 1);
            else if (planId === '6_months') expiryDate.setMonth(now.getMonth() + 6);
            else if (planId === '3_months') expiryDate.setMonth(now.getMonth() + 3);

            // Update Payment Doc
            transaction.update(paymentRef, {
                claimed: true,
                claimedBy: userId,
                claimedAt: Timestamp.now()
            });

            // Update User Doc
            transaction.update(userRef, {
                subscription_tier: 'premium',
                subscription_plan: planId,
                subscription_expiry: Timestamp.fromDate(expiryDate),
                payment_history: arrayUnion({
                    payment_id: paymentId,
                    amount: paymentData.amount,
                    date: Timestamp.now(),
                    plan: planId,
                    provider: 'razorpay_claim',
                    status: 'success'
                })
            });
        });

        return NextResponse.json({ success: true, message: 'Subscription activated' });

    } catch (error: any) {
        console.error('Claim Error:', error);
        return NextResponse.json({ error: error.message || 'Claim failed' }, { status: 400 });
    }
}
