// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdminAuth } from '@/lib/api-auth';
import type { FirestoreProduct, AdminProduct } from '@/app/admin/types';
import { adminToFirestore } from '@/app/admin/types';
import { slugify } from '@/lib/utils';
import { FieldValue } from 'firebase-admin/firestore';
import { productSchema } from '@/lib/validations';

// Normalize a product name for duplicate detection (trim + lowercase)
function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function GET(request: Request) {
  const { error } = await requireAdminAuth(request as any, []);
  if (error) return error;
  try {
    // Sort by newest first
    const snapshot = await adminDb
      .collection('products')
      .orderBy('createdAt', 'desc')
      .get();
    const products: FirestoreProduct[] = snapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as FirestoreProduct)
    );
    return NextResponse.json({ products });
  } catch (err: any) {
    console.error('[API] GET /api/products failed:', err.message);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminAuth(request as any, ['manager', 'product_manager']);
  if (error) return error;
  try {
    const body = await request.json();

    // ── Duplicate name check ────────────────────────────────────────────────
    const normalized = normalizeName(body.name ?? '');
    if (!normalized) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }
    const dupSnap = await adminDb
      .collection('products')
      .where('normalizedName', '==', normalized)
      .limit(1)
      .get();
    if (!dupSnap.empty) {
      return NextResponse.json(
        { error: `A product named "${body.name.trim()}" already exists.` },
        { status: 409 }
      );
    }

    // ── Slug uniqueness ─────────────────────────────────────────────────────
    let slug = slugify(body.name);
    let finalSlug = slug;
    let counter = 1;
    let slugExists = true;
    while (slugExists) {
      const snap = await adminDb
        .collection('products')
        .where('slug', '==', finalSlug)
        .limit(1)
        .get();
      if (snap.empty) slugExists = false;
      else { finalSlug = `${slug}-${counter}`; counter++; }
    }
    body.slug = finalSlug;
    body.normalizedName = normalized;

    // ── Zod validation ──────────────────────────────────────────────────────
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    // ── If this product is featured, un-feature all others ──────────────────
    if (body.isFeatured) {
      const featuredSnap = await adminDb
        .collection('products')
        .where('isFeatured', '==', true)
        .get();
      const batch = adminDb.batch();
      featuredSnap.docs.forEach(d => batch.update(d.ref, { isFeatured: false }));
      await batch.commit();
    }

    const firestoreData = adminToFirestore(body as AdminProduct);
    const dataWithTimestamps = {
      ...firestoreData,
      normalizedName: normalized,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('products').add(dataWithTimestamps);
    const createdDoc = await docRef.get();
    const created: FirestoreProduct = { id: docRef.id, ...createdDoc.data() } as FirestoreProduct;
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('[API] POST /api/products failed:', err.message);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
