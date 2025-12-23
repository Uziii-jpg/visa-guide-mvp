import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Razorpay Webhook:', JSON.stringify(body));

        // SECURITY: SIGNATURE VERIFICATION DISABLED (As requested)

        if (body.event === 'payment.captured' || body.event === 'order.paid') {
            const payment = body.payload.payment.entity;
            const amount = payment.amount / 100; // paise to rupees
            const contact = payment.contact;
            const email = payment.email;
            const paymentId = payment.id;

            // Determine Plan (For metadata)
            let planId = 'unknown';
            if (amount >= 250) planId = '1_year';
            else if (amount >= 150) planId = '6_months';
            else if (amount >= 100) planId = '3_months';
            else if (amount > 0) planId = '3_months'; // Test mapping

            // STORE PAYMENT FOR CLAIMING
            // We save it to 'payments' collection so the frontend can 'claim' it.
            // ID = razorpay_payment_id ensures uniqueness.
            await setDoc(doc(db, 'payments', paymentId), {
                amount: amount,
                planId: planId,
                status: 'captured', // Confirmed paid
                claimed: false, // Ready to be claimed
                claimedBy: null,
                payerEmail: email || null,
                payerPhone: contact || null,
                createdAt: Timestamp.now(),
                rawDates: {
                    created_at: payment.created_at
                }
            });

            console.log(`Payment stored for claiming: ${paymentId} (${amount} INR)`);
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Razorpay Callback Error:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
