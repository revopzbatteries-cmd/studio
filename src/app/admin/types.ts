// Shared types for the Admin Product Management system

// ── Gallery image type ────────────────────────────────────────────────────────

export type ProductGalleryImage = {
  id: string;        // uuid generated on client
  url: string;       // Cloudinary secure_url
  publicId: string;  // Cloudinary public_id (for deletion)
  isMain: boolean;   // exactly one image in the array should have this true
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category: 'inverters' | 'batteries' | 'systems';
  powerRating: string;
  description: string;       // shortDescription shown on listing cards
  fullDescription: string;   // longer body text shown on detail page
  /** @deprecated Use galleryImages instead. Kept for backward compatibility. */
  image: string;
  /** @deprecated Use galleryImages instead. Kept for backward compatibility. */
  imagePublicId: string;
  galleryImages: ProductGalleryImage[];
  performance: string[];
  features: string[];
  safety: string[];
  idealFor: string[];
  specifications: { key: string; value: string }[];
  warranty: string;          // e.g. "2 Years"
  warrantyMonths: number;    // numeric warranty for logic
  installation: string;
  isPublished: boolean;
  isFeatured: boolean;
};

// ── Firestore document shape ──────────────────────────────────────────────────

export type FirestoreGalleryImage = {
  url: string;
  publicId: string;
  isMain: boolean;
};

// Shape returned by Firestore (used by both admin API and public pages)
export type FirestoreProduct = {
  id: string;
  // New field names to align with manufactured_units
  productName: string;       // maps to name
  power: string;             // maps to powerRating
  warrantyMonths: number;
  status: 'Published' | 'Draft';
  
  // Existing fields (kept for backward compatibility and website)
  name: string;
  slug: string;
  category: 'inverters' | 'batteries' | 'systems';
  powerRating: string;
  shortDescription: string;
  description: string;
  /** Primary image URL — derived from galleryImages[isMain=true].url, kept for backward compat */
  imageUrl: string;
  imagePublicId?: string;
  galleryImages?: FirestoreGalleryImage[];
  performance: string[];
  features: string[];
  safety: string[];
  idealFor: string[];
  technicalSpecifications: Record<string, string>;
  warranty: string;
  installation: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt?: any;
  updatedAt?: any;
};

// ── Converters ────────────────────────────────────────────────────────────────

/** Firestore doc → AdminProduct (for admin form pre-fill) */
export function firestoreToAdmin(doc: FirestoreProduct): AdminProduct {
  // Rebuild galleryImages from Firestore. If legacy doc has no galleryImages
  // but has imageUrl, synthesise a single-entry gallery from it.
  let galleryImages: ProductGalleryImage[] = [];

  if (doc.galleryImages && doc.galleryImages.length > 0) {
    galleryImages = doc.galleryImages.map((g, i) => ({
      id: `existing-${i}-${Date.now()}`,
      url: g.url,
      publicId: g.publicId ?? '',
      isMain: g.isMain,
    }));
  } else if (doc.imageUrl) {
    galleryImages = [{
      id: `legacy-${Date.now()}`,
      url: doc.imageUrl,
      publicId: doc.imagePublicId ?? '',
      isMain: true,
    }];
  }

  // Derive the "main" image for backward-compat fields
  const mainImg = galleryImages.find(g => g.isMain) ?? galleryImages[0];

  return {
    id: doc.id,
    name: doc.name || doc.productName || '',
    slug: doc.slug,
    category: doc.category,
    powerRating: doc.powerRating || doc.power || '',
    description: doc.shortDescription,
    fullDescription: doc.description,
    image: mainImg?.url ?? '',
    imagePublicId: mainImg?.publicId ?? '',
    galleryImages,
    performance: doc.performance ?? [],
    features: doc.features ?? [],
    safety: doc.safety ?? [],
    idealFor: doc.idealFor ?? [],
    specifications: Object.entries(doc.technicalSpecifications ?? {}).map(([key, value]) => ({ key, value })),
    warranty: doc.warranty ?? '',
    warrantyMonths: doc.warrantyMonths ?? 60,
    installation: doc.installation ?? '',
    isPublished: doc.isPublished ?? (doc.status === 'Published'),
    isFeatured: doc.isFeatured ?? false,
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

  const gallery = (p.galleryImages || []).map(g => ({
    url: g.url,
    publicId: g.publicId,
    isMain: g.isMain,
  }));

  const mainImg = gallery.find(g => g.isMain) ?? gallery[0];

  return {
    // New fields
    productName: p.name.trim(),
    power: p.powerRating.trim(),
    warrantyMonths: p.warrantyMonths || 0,
    status: p.isPublished ? 'Published' : 'Draft',

    // Existing fields
    name: p.name.trim(),
    slug: p.slug.trim(),
    category: p.category,
    powerRating: p.powerRating.trim(),
    shortDescription: p.description.trim(),
    description: p.fullDescription?.trim() ?? '',
    imageUrl: mainImg?.url || p.image || '',
    imagePublicId: mainImg?.publicId || p.imagePublicId || '',
    galleryImages: gallery,
    performance: p.performance || [],
    features: p.features || [],
    safety: p.safety || [],
    idealFor: p.idealFor || [],
    technicalSpecifications: specs,
    warranty: p.warranty,
    installation: p.installation,
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
  };
}

