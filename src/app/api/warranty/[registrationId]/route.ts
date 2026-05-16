import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params;

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    const doc = await adminDb.collection('warranties').doc(registrationId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Warranty not found' }, { status: 404 });
    }

    const data = doc.data();
    return NextResponse.json({ 
      id: doc.id, 
      ...data,
      registrationId: doc.id 
    });

  } catch (err: any) {
    console.error('[API] GET /api/warranty/[registrationId] failed:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
