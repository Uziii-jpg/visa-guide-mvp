import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { planId, firstname, email, phone } = await req.json();

        const PAYU_KEY = process.env.PAYU_KEY; // Merchant Key
        const PAYU_SALT = process.env.PAYU_SALT; // Merchant Salt

        if (!PAYU_KEY || !PAYU_SALT) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const PLANS = {
            '1_year': { amount: 250, name: 'Yearly Subscription' },
            '6_months': { amount: 150, name: 'Bi-Annual Subscription' },
            '3_months': { amount: 100, name: 'Quarterly Subscription' },
        };

        if (!planId || !PLANS[planId as keyof typeof PLANS]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const plan = PLANS[planId as keyof typeof PLANS];
        const txnid = 'txn_' + Date.now() + Math.floor(Math.random() * 1000);
        const amount = plan.amount.toFixed(2);
        const productinfo = planId;
        const surl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/payu-response`;
        const furl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/payu-response`;

        // Hash Sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
        const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        return NextResponse.json({
            key: PAYU_KEY,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            phone: phone || '9999999999', // Default if not provided
            surl,
            furl,
            hash,
            action: 'https://test.payu.in/_payment' // Change to https://secure.payu.in/_payment for production
        });

    } catch (error) {
        console.error('Error initiating PayU payment:', error);
        return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
    }
}
