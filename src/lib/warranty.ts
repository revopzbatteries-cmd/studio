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
