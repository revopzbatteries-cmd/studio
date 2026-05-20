export type WarrantyStatus = 'Active' | 'Expired' | 'Claim Requested' | 'Claim Approved' | 'Claim Rejected';

export type WarrantyEntry = {
  id: string;
  serialNumber: string;
  productName: string;
  customerName: string;
  phone: string;
  email: string;
  purchaseDate: string;
  expiryDate: string;
  status: WarrantyStatus;
  claimMessage?: string;
  address?: string;
};

export const INITIAL_WARRANTIES: WarrantyEntry[] = [
  {
    id: 'w-1',
    serialNumber: 'RV-1K-001',
    productName: 'Lithium Inverter 1kVA',
    customerName: 'Suresh Kumar',
    phone: '+91 98765 43210',
    email: 'suresh@example.com',
    purchaseDate: '2023-10-15',
    expiryDate: '2025-10-15',
    status: 'Active'
  },
  {
    id: 'w-2',
    serialNumber: 'RV-B12-552',
    productName: 'Lithium Battery 12V',
    customerName: 'Anjali Menon',
    phone: '+91 99887 76655',
    email: 'anjali@example.com',
    purchaseDate: '2022-05-20',
    expiryDate: '2027-05-20',
    status: 'Claim Requested',
    claimMessage: 'The battery backup has significantly dropped after 1 year of usage.'
  }
];

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, FirestoreError, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

function mapWarrantyDoc(docSnapshot: QueryDocumentSnapshot): WarrantyEntry {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    serialNumber: data.serialNumber || '',
    productName: data.productName || '',
    customerName: data.customerName || '',
    phone: data.customerPhone || data.phone || '',
    email: data.customerEmail || data.email || '',
    purchaseDate: data.installationDate || data.warrantyStartDate || '',
    expiryDate: data.warrantyEndDate || '',
    status: data.status || 'Active',
    claimMessage: data.claimMessage || '',
    address: data.address || '',
  };
}

export function useWarranties() {
  const { user, adminProfile, loading: authLoading } = useAuth();
  const [warranties, setWarranties] = useState<WarrantyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user || !adminProfile) {
      setWarranties([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    const q = query(collection(db, 'warranties'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mapped = snapshot.docs.map(mapWarrantyDoc);
        setWarranties(mapped);
        console.log("[Warranty Management] Loaded warranties:", mapped.length);
        setIsLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Error fetching warranties:", err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, adminProfile, authLoading]);

  return { warranties, isLoading: authLoading || isLoading, error };
}
