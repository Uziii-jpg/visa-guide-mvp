import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planId, userId, locale } = body;

        // Fetch User Data for real customer info
        let customerName = "VisaGuide User";
        let customerEmail = "user@visaguide.world";
        let customerMobile = "9999999999";

        if (userId) {
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // Try to get data from personal_details or top-level fields
                    customerName = userData.personal_details?.full_name_passport || userData.displayName || customerName;
                    customerEmail = userData.email || customerEmail;
                    // Prioritize the newly added field
                    customerMobile = userData.personal_details?.phone_number || userData.phoneNumber || customerMobile;
                }
            } catch (e) {
                console.warn('Failed to fetch user data for payment:', e);
            }
        }

        // Configuration
        const key = process.env.UPIGATEWAY_KEY;
        // Use request origin if available (for localhost/IP correctness), else env var, else fallback
        const origin = req.nextUrl.origin;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin || 'http://localhost:3000';

        if (!key) {
            return NextResponse.json({ error: 'Payment configuration missing' }, { status: 500 });
        }

        // Calculate amount based on plan (Server-side validation)
        const PLANS: Record<string, number> = {
            '1_year': 250,
            '6_months': 150,
            '3_months': 100,
        };
        const amount = PLANS[planId];

        if (!amount) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        // Generate Transaction ID and Date
        const now = new Date();
        const client_txn_id = `TXN_${userId.substring(0, 6)}_${now.getTime()}`;
        const txnDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

        // Prepare Payload for Ekqr
        const payload = {
            key: key,
            client_txn_id: client_txn_id,
            amount: amount.toString(),
            p_info: `VisaGuide Subscription - ${planId}`,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_mobile: customerMobile,
            redirect_url: `${baseUrl}/${locale}/payment/status?planId=${planId}&txnId=${client_txn_id}&txnDate=${txnDate}`,
            udf1: planId,
            udf2: userId,
            udf3: locale
        };

        console.log('Ekqr Payload:', JSON.stringify(payload, null, 2));

        const response = await fetch('https://api.ekqr.in/api/create_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.status && data.data?.payment_url) {
            return NextResponse.json({ url: data.data.payment_url });
        } else {
            console.error('Ekqr Error:', data);
            return NextResponse.json({ error: data.msg || 'Payment initiation failed' }, { status: 400 });
        }

    } catch (error) {
        console.error('Payment Init Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
