import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(req: NextRequest) {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
        }));

        return NextResponse.json({
            count: users.length,
            users: users
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
