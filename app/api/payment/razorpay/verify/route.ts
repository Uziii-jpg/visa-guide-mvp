import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { paymentLinkId } = body;

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const plink = await razorpay.paymentLink.fetch(paymentLinkId);

        if (plink.status === 'paid') {
            return NextResponse.json({ success: true, status: 'paid' });
        } else {
            return NextResponse.json({ success: false, status: plink.status });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Check failed' }, { status: 500 });
    }
}
