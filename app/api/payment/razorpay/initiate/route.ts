import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planId, userId, locale } = body;

        // Plan Validation
        const PLANS: Record<string, number> = {
            '1_year': 250,
            '6_months': 150,
            '3_months': 100,
        };
        const amount = PLANS[planId];
        if (!amount) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: 'Razorpay config missing' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const referenceId = uuidv4();
        // Convert amount to paise (integer)
        const amountInPaise = amount * 100;

        // Determine callback URL (must be public)
        // Hardcoding production/ngrok for now, or using env.
        // User's current ngrok: https://c7f054cd4615.ngrok-free.app
        // ideally use req.origin but Razorpay needs a reachable URL for callback redirect.
        // The Docs say "callback_url: If specified, adds a redirect URL to the Payment Link."
        // We want the user to be redirected to our status page.
        const origin = req.headers.get('origin') || 'https://visaguide.live';
        const callbackUrl = `${origin}/${locale}/payment/status?planId=${planId}`;

        // Create Payment Link
        // Docs: upi_link: true (optional, creates specifically UPI link)
        const paymentLinkRequest = {
            amount: amountInPaise,
            currency: "INR",
            accept_partial: false,
            reference_id: referenceId,
            description: `Subscription for ${planId} plan`,
            customer: {
                name: userData?.personal_details?.full_name || "User",
                email: userData?.email || "user@example.com",
                contact: userData?.personal_details?.phone_number || "+919999999999"
            },
            notify: {
                sms: true,
                email: true
            },
            reminder_enable: true,
            callback_url: callbackUrl,
            callback_method: "get",
            upi_link: true, // Create UPI specific link as requested
            notes: {
                userId: userId,
                planId: planId
            }
        };

        const response = await razorpay.paymentLink.create(paymentLinkRequest);

        return NextResponse.json({
            url: response.short_url,
            paymentLinkId: response.id,
            referenceId: referenceId
        });

    } catch (error) {
        console.error('Razorpay Initiate Error:', error);
        return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
    }
}
