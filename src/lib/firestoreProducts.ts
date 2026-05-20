/**
 * Client-side Firestore helpers for the public website product pages.
 * These use the Firebase client SDK (no admin credentials required).
 * Only `isPublished == true` products are returned.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreProduct } from '@/app/admin/types';

const COLLECTION = 'products';

// ── All published products ────────────────────────────────────────────────────

export async function getPublishedProducts(): Promise<FirestoreProduct[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('isPublished', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreProduct));
  } catch (err: any) {
    console.error('[firestoreProducts] getPublishedProducts failed:', err.message);
    return [];
  }
}

// ── Single product by slug ────────────────────────────────────────────────────

export async function getProductBySlugFromFirestore(
  slug: string
): Promise<FirestoreProduct | null> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('slug', '==', slug),
      where('isPublished', '==', true),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as FirestoreProduct;
  } catch (err: any) {
    console.error('[firestoreProducts] getProductBySlug failed:', err.message);
    return null;
  }
}

// ── Products by category ──────────────────────────────────────────────────────

export async function getPublishedProductsByCategory(
  category: string
): Promise<FirestoreProduct[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('isPublished', '==', true),
      where('category', '==', category)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreProduct));
  } catch (err: any) {
    console.error('[firestoreProducts] getPublishedProductsByCategory failed:', err.message);
    return [];
  }
}

// ── Featured products ─────────────────────────────────────────────────────────

export async function getFeaturedProducts(): Promise<FirestoreProduct[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('isPublished', '==', true),
      where('isFeatured', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreProduct));
  } catch (err: any) {
    console.error('[firestoreProducts] getFeaturedProducts failed:', err.message);
    return [];
  }
}

// ── Get by Firestore doc ID (admin use via client) ────────────────────────────

export async function getProductById(id: string): Promise<FirestoreProduct | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as FirestoreProduct;
  } catch (err: any) {
    console.error('[firestoreProducts] getProductById failed:', err.message);
    return null;
  }
}
