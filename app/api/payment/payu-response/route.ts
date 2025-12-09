import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp, arrayUnion, getDocs, query, collection, where } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const status = formData.get('status') as string;
        const firstname = formData.get('firstname') as string;
        const amount = formData.get('amount') as string;
        const txnid = formData.get('txnid') as string;
        const posted_hash = formData.get('hash') as string;
        const key = formData.get('key') as string;
        const productinfo = formData.get('productinfo') as string;
        const email = formData.get('email') as string;
        const salt = process.env.PAYU_SALT;

        if (!salt) {
            console.error('PAYU_SALT not found');
            return NextResponse.redirect(new URL('/subscribe?status=server_error', req.url));
        }

        // Hash Sequence for verification: salt|status|||||||||||email|firstname|productinfo|amount|txnid|key
        const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
        const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

        if (calculatedHash !== posted_hash) {
            console.error('Hash verification failed');
            return NextResponse.redirect(new URL('/subscribe?status=hash_mismatch', req.url));
        }

        if (status === 'success') {
            // Find user by email since we don't strictly pass uid in UDFs (though we could have)
            // Ideally we should pass UID in udf1. For now, we query by email or rely on session after redirect if we trust the email.
            // Better approach: Query by email to find UID.

            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const now = new Date();
                let expiryDate = new Date();

                if (productinfo === '1_year') expiryDate.setFullYear(now.getFullYear() + 1);
                else if (productinfo === '6_months') expiryDate.setMonth(now.getMonth() + 6);
                else if (productinfo === '3_months') expiryDate.setMonth(now.getMonth() + 3);

                await updateDoc(userDoc.ref, {
                    subscription_tier: 'premium',
                    subscription_plan: productinfo,
                    subscription_expiry: Timestamp.fromDate(expiryDate),
                    payment_history: arrayUnion({
                        order_id: txnid,
                        payment_id: txnid, // PayU uses txnid/mihpayid
                        amount: parseFloat(amount),
                        date: Timestamp.now(),
                        plan: productinfo,
                        provider: 'payu'
                    })
                });
            }

            return NextResponse.redirect(new URL('/profile?payment=success', req.url));
        } else {
            return NextResponse.redirect(new URL('/subscribe?status=failed', req.url));
        }

    } catch (error) {
        console.error('Error handling PayU response:', error);
        return NextResponse.redirect(new URL('/subscribe?status=error', req.url));
    }
}
