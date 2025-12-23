import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // 1. Get User Details (Phone/Email)
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userSnap.data();
        const userEmail = userData.email || null; // Might be missing in DB as seen before
        // Check personal_details.phone_number
        const userPhone = userData.personal_details?.phone_number || null;

        if (!userEmail && !userPhone) {
            return NextResponse.json({ found: false, message: 'No contact details in user profile to match payment.' });
        }

        // 2. Search Unclaimed Payments
        // We look for payments created recently (e.g. last 15 mins?) 
        // Or just any unclaimed matching payment.

        const paymentsRef = collection(db, 'payments');

        let foundPayment = null;

        // Strategy: Check by Phone first (more reliable for this user)
        if (userPhone && typeof userPhone === 'string') {
            // Need to handle normalization. 
            // Webhook stores: 8200116005 (clean 10 digits in my simplified logic)
            // or 8200116005 (raw contact cleaned)
            // Let's assume the Webhook 'cleanPhone' logic stored just the digits.

            // 1. Try Exact Match
            let q = query(
                paymentsRef,
                where('claimed', '==', false),
                where('payerPhone', '==', userPhone)
            );
            let snap = await getDocs(q);

            // 2. Try with +91 Prefix (Common Razorpay format)
            if (snap.empty && !userPhone.startsWith('+')) {
                const prefixedPhone = `+91${userPhone}`;
                q = query(
                    paymentsRef,
                    where('claimed', '==', false),
                    where('payerPhone', '==', prefixedPhone)
                );
                snap = await getDocs(q);
            }

            if (!snap.empty) {
                // Sort in memory (Newest first)
                const payDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                payDocs.sort((a: any, b: any) => b.createdAt.seconds - a.createdAt.seconds);
                foundPayment = payDocs[0];
            }
        }

        // Fallback: Check by Email (if not found by phone)
        if (!foundPayment && userEmail) {
            const q = query(
                paymentsRef,
                where('claimed', '==', false),
                where('payerEmail', '==', userEmail)
                // REMOVED orderBy
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                // Sort in memory
                const payDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                payDocs.sort((a: any, b: any) => b.createdAt.seconds - a.createdAt.seconds);
                foundPayment = payDocs[0];
            }
        }

        console.log(`Find-Unclaimed: Search Result for User ${userId} (Phone: ${userPhone}, Email: ${userEmail}) -> Found: ${foundPayment ? foundPayment.id : 'None'}`);

        if (foundPayment) {
            return NextResponse.json({ found: true, paymentId: foundPayment.id });
        } else {
            // OPTIONAL: Check if they have a RECENTLY CLAIMED payment (e.g. last 5 mins)
            // This helps if they refresh the page.
            // We can't easily query "All Claimed by User" without index if we sort.
            // But we can check by ID if we had one? No.

            return NextResponse.json({ found: false, searchDetails: { phone: userPhone, email: userEmail } });
        }

    } catch (error: any) {
        console.error('Find Unclaimed Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
