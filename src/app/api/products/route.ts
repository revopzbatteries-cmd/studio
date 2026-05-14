// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdminAuth } from '@/lib/api-auth';
import type { FirestoreProduct, AdminProduct } from '@/app/admin/types';
import { adminToFirestore } from '@/app/admin/types';
import { slugify } from '@/lib/utils';
import { FieldValue } from 'firebase-admin/firestore';
import { productSchema } from '@/lib/validations';

export async function GET(request: Request) {
  // Admin authentication (any admin role)
  const { error } = await requireAdminAuth(request as any, []);
  if (error) return error;
  try {
    const snapshot = await adminDb.collection('products').orderBy('displayOrder', 'asc').get();
    const products: FirestoreProduct[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreProduct));
    return NextResponse.json({ products });
  } catch (err: any) {
    console.error('[API] GET /api/products failed:', err.message);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Only managers or product_manager can create
  const { error, adminProfile } = await requireAdminAuth(request as any, ['manager', 'product_manager']);
  if (error) return error;
  try {
    const body = await request.json();
    
    // Generate initial slug
    let slug = slugify(body.name);
    
    // Check for uniqueness and append suffix if needed
    let finalSlug = slug;
    let counter = 1;
    let exists = true;
    while (exists) {
      const snap = await adminDb.collection('products').where('slug', '==', finalSlug).limit(1).get();
      if (snap.empty) {
        exists = false;
      } else {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
    }
    
    body.slug = finalSlug;

    // Validate with Zod
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.format() }, { status: 400 });
    }

    const firestoreData = adminToFirestore(body as AdminProduct);
    
    const dataWithTimestamps = {
      ...firestoreData,
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
