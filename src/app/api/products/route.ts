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
    const productsSnap = await adminDb
      .collection('products')
      .get();

    const products = productsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FirestoreProduct));

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('[API] GET /api/products failed:', error.message);
    return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError } = await requireAdminAuth(request as any, ['manager', 'product_manager']);
    if (authError) return authError;

    const body = await request.json();

    // ── Pre-validation ───────────────────────────────────────────────────────
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }

    const normalized = normalizeName(body.name);

    // ── Duplicate name check ────────────────────────────────────────────────
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

    // ── Slug Generation ──────────────────────────────────────────────────────
    let slug = slugify(body.name);
    let finalSlug = slug;
    let counter = 1;
    let slugExists = true;

    while (slugExists) {
      const snap = await adminDb.collection('products').where('slug', '==', finalSlug).get();
      if (snap.empty) slugExists = false;
      else {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
    }

    body.slug = finalSlug;
    body.normalizedName = normalized;

    // ── Validation ───────────────────────────────────────────────────────────
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      console.error('[API] POST /api/products validation failed:', JSON.stringify(validation.error.format(), null, 2));
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }

    // ── Handle featured status ───────────────────────────────────────────────
    if (body.isFeatured) {
      const featuredSnap = await adminDb
        .collection('products')
        .where('isFeatured', '==', true)
        .get();
      const batch = adminDb.batch();
      featuredSnap.docs.forEach(d => batch.update(d.ref, { isFeatured: false }));
      await batch.commit();
    }

    // ── Transformation & Save ────────────────────────────────────────────────
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

    console.log(`[API] Product created: ${created.id} (${created.name})`);

    return NextResponse.json({ 
      success: true, 
      product: created 
    }, { status: 201 });

  } catch (err: any) {
    console.error('[API] POST /api/products failed:', err.message);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err.message },
      { status: 500 }
    );
  }
}
