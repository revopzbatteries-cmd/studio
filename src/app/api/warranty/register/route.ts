import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      serialNumber,
      productName,
      category,
      model,
    } = body;

    // Validate essential fields
    if (!customerName || !customerPhone || !serialNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if warranty already registered for this serial
    const existingSnap = await adminDb
      .collection('warranties')
      .where('serialNumber', '==', serialNumber)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json({ error: 'Warranty already registered for this serial number' }, { status: 400 });
    }

    // Generate Registration ID
    const registrationId = `WAR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Compute dates
    const today = new Date();
    const expiry = new Date(today);
    expiry.setFullYear(expiry.getFullYear() + 2); // 2 years default

    const warrantyStartDate = today.toISOString().split('T')[0];
    const warrantyEndDate = expiry.toISOString().split('T')[0];

    // Build Firestore document payload
    const warrantyData = {
      registrationId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      address,
      serialNumber,
      productName,
      category,
      model,
      powerRating: model, // Using model as power rating if not separate
      installationDate: warrantyStartDate,
      warrantyStartDate,
      warrantyEndDate,
      warrantyStatus: 'active',
      dealerName: 'REVOPZ Direct',
      dealerPhone: '+91 97468 04951',
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    await adminDb.collection('warranties').doc(registrationId).set(warrantyData);

    return NextResponse.json({ success: true, registrationId });
  } catch (err: any) {
    console.error('[API] Warranty registration failed:', err.message);
    return NextResponse.json({ error: 'Failed to register warranty' }, { status: 500 });
  }
}
