// Shared types for the Admin Product Management system

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category: 'inverters' | 'batteries' | 'systems';
  powerRating: string;
  description: string;       // shortDescription shown on listing cards
  fullDescription: string;   // longer body text shown on detail page
  image: string;             // Cloudinary URL (stored after upload)
  imagePublicId: string;     // Cloudinary public_id (for deletion)
  performance: string[];
  features: string[];
  safety: string[];
  idealFor: string[];
  specifications: { key: string; value: string }[];
  warranty: string;
  installation: string;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
};

// Shape returned by Firestore (used by both admin API and public pages)
export type FirestoreProduct = {
  id: string;
  name: string;
  slug: string;
  category: 'inverters' | 'batteries' | 'systems';
  powerRating: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  performance: string[];
  features: string[];
  safety: string[];
  idealFor: string[];
  technicalSpecifications: Record<string, string>;
  warranty: string;
  installation: string;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt?: any;
  updatedAt?: any;
};

// ── Converters ────────────────────────────────────────────────────────────────

/** Firestore doc → AdminProduct (for admin form pre-fill) */
export function firestoreToAdmin(doc: FirestoreProduct): AdminProduct {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    powerRating: doc.powerRating,
    description: doc.shortDescription,
    fullDescription: doc.description,
    image: doc.imageUrl,
    imagePublicId: doc.imagePublicId ?? '',
    performance: doc.performance ?? [],
    features: doc.features ?? [],
    safety: doc.safety ?? [],
    idealFor: doc.idealFor ?? [],
    specifications: Object.entries(doc.technicalSpecifications ?? {}).map(([key, value]) => ({ key, value })),
    warranty: doc.warranty ?? '',
    installation: doc.installation ?? '',
    isPublished: doc.isPublished ?? false,
    isFeatured: doc.isFeatured ?? false,
    displayOrder: doc.displayOrder ?? 0,
  };
}

/** AdminProduct form data → Firestore document shape */
export function adminToFirestore(
  p: AdminProduct
): Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'> {
  const specs: Record<string, string> = {};
  (p.specifications || []).forEach(({ key, value }) => {
    if (key.trim()) specs[key.trim()] = value;
  });

  return {
    name: p.name.trim(),
    slug: p.slug.trim(),
    category: p.category,
    powerRating: p.powerRating.trim(),
    shortDescription: p.description.trim(),
    description: p.fullDescription?.trim() ?? '',
    imageUrl: p.image || '',
    imagePublicId: p.imagePublicId || '',
    performance: p.performance || [],
    features: p.features || [],
    safety: p.safety || [],
    idealFor: p.idealFor || [],
    technicalSpecifications: specs,
    warranty: p.warranty,
    installation: p.installation,
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
    displayOrder: p.displayOrder,
  };
}
