import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreRole } from '@/lib/adminService';
import type { AddManufacturedUnitFormData } from '@/lib/validations';
import { normalizeProductNumber } from '@/lib/validations';

const MANUFACTURED_UNITS_COLLECTION = 'manufactured_units';

export type ManufacturedUnitCategory = 'Inverter' | 'Battery' | 'Solar' | 'Other';
export type ManufacturedUnitStatus = 'Ready' | 'Registered';

export interface ManufacturedUnit {
  id: string;
  productName: string;
  productNumber: string;
  category: ManufacturedUnitCategory;
  manufacturedDate: string;
  warrantyMonths: number;
  status: ManufacturedUnitStatus;
  createdAt: Timestamp | null;
  createdBy: string;
  createdByName: string;
  createdByRole: FirestoreRole;
}

export interface CreateManufacturedUnitInput extends AddManufacturedUnitFormData {
  createdBy: string;
  createdByName: string;
  createdByRole: FirestoreRole;
}

function mapManufacturedUnitDoc(docSnapshot: QueryDocumentSnapshot): ManufacturedUnit {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    productName: data.productName ?? '',
    productNumber: data.productNumber ?? '',
    category: data.category ?? 'Other',
    manufacturedDate: data.manufacturedDate ?? data.manufacturingDate ?? '',
    warrantyMonths: Number(data.warrantyMonths ?? 0),
    status: data.status ?? 'Ready',
    createdAt: data.createdAt ?? null,
    createdBy: data.createdBy ?? '',
    createdByName: data.createdByName ?? '',
    createdByRole: data.createdByRole,
  };
}

function getUnitRef(productNumber: string) {
  return doc(db, MANUFACTURED_UNITS_COLLECTION, productNumber);
}

export function subscribeToManufacturedUnits(
  onUnits: (units: ManufacturedUnit[]) => void,
  onError: (error: FirestoreError) => void
): Unsubscribe {
  const unitsQuery = query(
    collection(db, MANUFACTURED_UNITS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    unitsQuery,
    snapshot => onUnits(snapshot.docs.map(mapManufacturedUnitDoc)),
    onError
  );
}

export async function manufacturedUnitNumberExists(productNumber: string): Promise<boolean> {
  const normalizedNumber = normalizeProductNumber(productNumber);
  const existingDoc = await getDoc(getUnitRef(normalizedNumber));

  if (existingDoc.exists()) return true;

  const duplicateQuery = query(
    collection(db, MANUFACTURED_UNITS_COLLECTION),
    where('productNumber', '==', normalizedNumber),
    limit(1)
  );
  const snapshot = await getDocs(duplicateQuery);

  return !snapshot.empty;
}

export async function addManufacturedUnit(
  input: CreateManufacturedUnitInput
): Promise<string> {
  const productNumber = normalizeProductNumber(input.productNumber);
  const duplicateExists = await manufacturedUnitNumberExists(productNumber);

  if (duplicateExists) {
    throw new Error('This product serial number already exists.');
  }

  await runTransaction(db, async transaction => {
    const unitRef = getUnitRef(productNumber);
    const unitSnapshot = await transaction.get(unitRef);

    if (unitSnapshot.exists()) {
      throw new Error('This product serial number already exists.');
    }

    transaction.set(unitRef, {
      productName: input.productName.trim(),
      productNameNormalized: input.productName.trim().toLowerCase(),
      productNumber,
      category: input.category,
      manufacturedDate: input.manufacturedDate,
      warrantyMonths: input.warrantyMonths,
      status: input.status,
      warrantyStatus: 'not_registered',
      createdBy: input.createdBy,
      createdByName: input.createdByName.trim(),
      createdByRole: input.createdByRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return productNumber;
}
