import { adminDb } from './firebase-admin';
import type { FirestoreProduct } from '@/app/admin/types';

const COLLECTION = 'products';

export async function getProductBySlugServer(slug: string): Promise<FirestoreProduct | null> {
  try {
    const snapshot = await adminDb.collection(COLLECTION)
      .where('slug', '==', slug)
      .where('isPublished', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    // Sanitize Timestamps for Client Components
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      data.createdAt = data.createdAt.toDate().toISOString();
    }
    if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
      data.updatedAt = data.updatedAt.toDate().toISOString();
    }

    return { id: doc.id, ...data } as FirestoreProduct;
  } catch (err: any) {
    console.error('[products-server] getProductBySlugServer failed:', err.message);
    return null;
  }
}

export async function getPublishedProductsServer(): Promise<FirestoreProduct[]> {
  try {
    const snapshot = await adminDb.collection(COLLECTION)
      .where('isPublished', '==', true)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Sanitize Timestamps for Client Components
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return { id: doc.id, ...data } as FirestoreProduct;
    });
  } catch (err: any) {
    console.error('[products-server] getPublishedProductsServer failed:', err.message);
    return [];
  }
}
