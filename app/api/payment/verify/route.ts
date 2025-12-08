import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId
        } = await req.json();

        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_secret) {
            console.error('Razorpay secret not found');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment is successful

            // Calculate expiry
            const now = new Date();
            let expiryDate = new Date();
            if (planId === '1_year') expiryDate.setFullYear(now.getFullYear() + 1);
            else if (planId === '6_months') expiryDate.setMonth(now.getMonth() + 6);
            else if (planId === '3_months') expiryDate.setMonth(now.getMonth() + 3);

            return NextResponse.json({
                success: true,
                expiry: expiryDate.toISOString(),
                planId
            });
        } else {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
