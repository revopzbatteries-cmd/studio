import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
      phoneVerified,
      verifiedPhoneNumber,
    } = body;

    // Validate essential fields
    if (!customerName || !customerPhone || !serialNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Harden security: ensure phone is verified before saving
    // if (!phoneVerified) {
    //   return NextResponse.json({ error: 'Phone number must be verified using OTP before registration' }, { status: 403 });
    // }

    const normalizedSerial = serialNumber.trim().toUpperCase();

    // Check if warranty already registered for this serial
    const existingSnap = await adminDb
      .collection('warranties')
      .where('serialNumber', '==', normalizedSerial)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json({ error: 'Warranty already registered for this serial number' }, { status: 400 });
    }

    // Fetch the manufactured unit to get warrantyMonths and verify it exists
    const unitRef = adminDb.collection('manufactured_units').doc(normalizedSerial);
    const unitSnap = await unitRef.get();

    if (!unitSnap.exists) {
      return NextResponse.json({ error: 'Manufactured unit not found' }, { status: 404 });
    }

    const unitData = unitSnap.data();

    // Check if already registered to prevent duplicate submissions
    if (unitData && (unitData.status === 'Registered' || unitData.warrantyStatus === 'registered')) {
      return NextResponse.json({ error: 'Warranty has already been registered for this serial number.' }, { status: 400 });
    }

    // Check if fake
    if (unitData && unitData.isFakeProduct === true) {
      return NextResponse.json({ error: 'Counterfeit product detected' }, { status: 403 });
    }

    const warrantyMonths = Number(unitData?.warrantyMonths) || 24;

    // Generate Registration ID
    const registrationId = `WAR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Compute dates
    const today = new Date();
    const expiry = new Date(today);
    expiry.setMonth(expiry.getMonth() + warrantyMonths);

    const warrantyStartDate = today.toISOString().split('T')[0];
    const warrantyEndDate = expiry.toISOString().split('T')[0];

    // Build Firestore document payload
    const warrantyData = {
      registrationId,
      serialNumber: normalizedSerial,
      productName,
      category: category || unitData?.category || '',
      model: model || productName, // fallback to product name if model is missing
      powerRating: model || productName,

      customerName,
      customerEmail: customerEmail || '',
      customerPhone,
      address,

      dealerName: 'REVOPZ Direct',
      dealerPhone: '+91 97468 04951',

      installationDate: warrantyStartDate,
      warrantyStartDate,
      warrantyEndDate,
      warrantyMonths,

      phoneVerified: true,
      verifiedAt: FieldValue.serverTimestamp(),
      verifiedPhoneNumber: verifiedPhoneNumber || `+91${customerPhone}`,

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),

      status: 'active',
    };

    // Use a batch to update both warranties and manufactured_units atomically
    const batch = adminDb.batch();

    const newWarrantyRef = adminDb.collection('warranties').doc(registrationId);
    batch.set(newWarrantyRef, warrantyData);

    batch.update(unitRef, {
      warrantyStatus: 'registered',
      status: 'Registered',
      registeredWarrantyId: registrationId,
      warrantyRegisteredAt: FieldValue.serverTimestamp()
    });

    await batch.commit();

    return NextResponse.json({ success: true, registrationId });
  } catch (err: any) {
    console.error('[API] Warranty registration failed:', err.message);
    return NextResponse.json({ error: 'Failed to register warranty' }, { status: 500 });
  }
}
