import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
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

const MANUFACTURED_UNITS_COLLECTION = 'manufactured_units';

export type ManufacturedUnitCategory = 'Inverter' | 'Battery' | 'Solar' | 'Other';
export type ManufacturedUnitStatus = 'Ready' | 'Registered';

export interface ManufacturedUnit {
  id: string;
  productName: string;
  productNumber: string;
  category: ManufacturedUnitCategory;
  manufacturingDate: string;
  warrantyMonths: number;
  status: ManufacturedUnitStatus;
  createdAt: Timestamp | null;
  createdBy: string;
  createdByRole: FirestoreRole;
}

export interface CreateManufacturedUnitInput extends AddManufacturedUnitFormData {
  createdBy: string;
  createdByRole: FirestoreRole;
}

function mapManufacturedUnitDoc(doc: QueryDocumentSnapshot): ManufacturedUnit {
  const data = doc.data();

  return {
    id: doc.id,
    productName: data.productName ?? '',
    productNumber: data.productNumber ?? '',
    category: data.category ?? 'Other',
    manufacturingDate: data.manufacturingDate ?? '',
    warrantyMonths: Number(data.warrantyMonths ?? 0),
    status: data.status ?? 'Ready',
    createdAt: data.createdAt ?? null,
    createdBy: data.createdBy ?? '',
    createdByRole: data.createdByRole,
  };
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
  const normalizedNumber = productNumber.trim().toUpperCase();
  const duplicateQuery = query(
    collection(db, MANUFACTURED_UNITS_COLLECTION),
    where('productNumber', '==', normalizedNumber),
    limit(1)
  );

  const snapshot = await getDocs(duplicateQuery);
  return !snapshot.empty;
}

export async function addManufacturedUnit(input: CreateManufacturedUnitInput): Promise<void> {
  const productNumber = input.productNumber.trim().toUpperCase();
  const exists = await manufacturedUnitNumberExists(productNumber);

  if (exists) {
    throw new Error('A manufactured unit with this product number already exists.');
  }

  await addDoc(collection(db, MANUFACTURED_UNITS_COLLECTION), {
    productName: input.productName.trim(),
    productNumber,
    category: input.category,
    manufacturingDate: input.manufacturingDate,
    warrantyMonths: input.warrantyMonths,
    status: input.status,
    createdAt: serverTimestamp(),
    createdBy: input.createdBy,
    createdByRole: input.createdByRole,
  });
}
