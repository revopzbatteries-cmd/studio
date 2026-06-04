import { adminDb } from '@/lib/firebase-admin';

export async function getWarrantyStatusBySerial(serial: string) {
  const normalizedSerial = serial.trim().toUpperCase();



  // 1. WARRANTIES COLLECTION FIRST
  const warrantiesQuery = adminDb.collection('warranties').where('serialNumber', '==', normalizedSerial).limit(1);
  const warrantiesSnap = await warrantiesQuery.get();
  
  const warrantyDoc = warrantiesSnap.empty ? null : warrantiesSnap.docs[0];
  if (warrantyDoc) {
    const warrantyData = warrantyDoc.data();

    
    const todayDateStr = new Date().toISOString().split('T')[0];
    const endDateStr = warrantyData.warrantyEndDate || '';
    
    let currentStatus = warrantyData.status;

    // AUTO WARRANTY STATUS UPDATE
    if (endDateStr) {
      if (todayDateStr > endDateStr) {
        currentStatus = 'expired';
      } else {
        currentStatus = 'active';
      }
    }

    return {
      found: true,
      source: "warranty",
      status: currentStatus,
      data: {
        ...warrantyData,
        registrationId: warrantyDoc.id,
        status: currentStatus
      }
    };
  }

  // 2. MANUFACTURED UNITS FALLBACK

  const unitRef = adminDb.collection('manufactured_units').doc(normalizedSerial);
  const unitSnap = await unitRef.get();
  const unitData = unitSnap.exists ? unitSnap.data() : null;

  if (unitData) {
    // Check Fake
    if (unitData.isFakeProduct === true) {
      return {
        found: true,
        status: "fake_product",
        reason: unitData.fakeReason || '',
        productNumber: normalizedSerial
      };
    }

    return {
      found: true,
      source: "manufactured_unit",
      status: "not_registered",
      data: {
        ...unitData,
        productNumber: unitData.productNumber || normalizedSerial 
      }
    };
  }

  return {
    found: false,
    source: null,
    status: "not_found"
  };
}
