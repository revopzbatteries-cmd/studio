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
    return { id: doc.id, ...doc.data() } as FirestoreProduct;
  } catch (err: any) {
    console.error('[products-server] getProductBySlugServer failed:', err.message);
    return null;
  }
}

export async function getPublishedProductsServer(): Promise<FirestoreProduct[]> {
  try {
    const snapshot = await adminDb.collection(COLLECTION)
      .where('isPublished', '==', true)
      .orderBy('displayOrder', 'asc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreProduct));
  } catch (err: any) {
    console.error('[products-server] getPublishedProductsServer failed:', err.message);
    return [];
  }
}
