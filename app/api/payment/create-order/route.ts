import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER', // Replace with env var
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_PLACEHOLDER', // Replace with env var
});

const PLANS = {
    '1_year': 250,
    '6_months': 150,
    '3_months': 100,
};

export async function POST(req: NextRequest) {
    try {
        const { planId } = await req.json();

        if (!planId || !PLANS[planId as keyof typeof PLANS]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const amount = PLANS[planId as keyof typeof PLANS] * 100; // Amount in paise

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: amount,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER'
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
