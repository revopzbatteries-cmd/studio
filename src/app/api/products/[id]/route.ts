// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdminAuth } from '@/lib/api-auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { FirestoreProduct, AdminProduct } from '@/app/admin/types';
import { adminToFirestore } from '@/app/admin/types';
import { deleteCloudinaryAssets, extractCloudinaryPublicIds } from '@/lib/cloudinary';

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdminAuth(request as any, []);
  if (error) return error;
  try {
    const doc = await adminDb.collection('products').doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ id: doc.id, ...doc.data() } as FirestoreProduct);
  } catch (err: any) {
    console.error('[API] GET /api/products/:id failed:', err.message);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdminAuth(request as any, ['manager', 'product_manager']);
  if (error) return error;
  try {
    const body = await request.json();

    // ── Partial update (toggles from togglePublish / toggleFeatured) ─────────
    // If body is just a partial flag update (no name field) skip full validation
    const isPartialUpdate = !body.name;

    if (isPartialUpdate) {
      // ── Enforce max 5 featured products rule ────────────────────────────────
      if (body.isFeatured === true) {
        const featuredSnap = await adminDb
          .collection('products')
          .where('isFeatured', '==', true)
          .get();
        const otherFeaturedCount = featuredSnap.docs.filter(d => d.id !== id).length;
        if (otherFeaturedCount >= 5) {
          return NextResponse.json({ error: 'Maximum 5 featured products allowed.' }, { status: 400 });
        }
      }
      await adminDb
        .collection('products')
        .doc(id)
        .set({ ...body, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      const updatedDoc = await adminDb.collection('products').doc(id).get();
      return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    }

    // ── Full product update ───────────────────────────────────────────────────
    const normalized = normalizeName(body.name ?? '');

    // Duplicate name check — exclude current doc
    const dupSnap = await adminDb
      .collection('products')
      .where('normalizedName', '==', normalized)
      .limit(1)
      .get();
    if (!dupSnap.empty && dupSnap.docs[0].id !== id) {
      return NextResponse.json(
        { error: `A product named "${body.name.trim()}" already exists.` },
        { status: 409 }
      );
    }

    // ── Enforce max 5 featured products rule ─────────────────────────────────
    if (body.isFeatured) {
      const featuredSnap = await adminDb
        .collection('products')
        .where('isFeatured', '==', true)
        .get();
      const otherFeaturedCount = featuredSnap.docs.filter(d => d.id !== id).length;
      if (otherFeaturedCount >= 5) {
        return NextResponse.json({ error: 'Maximum 5 featured products allowed.' }, { status: 400 });
      }
    }

    // ── Cleanup removed Cloudinary images ────────────────────────────────────
    const existingDoc = await adminDb.collection('products').doc(id).get();
    if (existingDoc.exists) {
      const oldData = existingDoc.data() as FirestoreProduct;
      const oldPublicIds = extractCloudinaryPublicIds(oldData);
      const newPublicIds = extractCloudinaryPublicIds(body);
      const removedIds = oldPublicIds.filter(pid => !newPublicIds.includes(pid));

      if (removedIds.length > 0) {
        await deleteCloudinaryAssets(removedIds);
      }
    }

    const firestoreData = adminToFirestore(body as AdminProduct);
    await adminDb
      .collection('products')
      .doc(id)
      .set(
        { ...firestoreData, normalizedName: normalized, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    const updatedDoc = await adminDb.collection('products').doc(id).get();
    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() } as FirestoreProduct);
  } catch (err: any) {
    console.error('[API] PUT /api/products/:id failed:', err.message);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdminAuth(request as any, ['manager']);
  if (error) return error;

  console.log(`Deleting product: ${id}`);

  try {
    const docRef = adminDb.collection('products').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    const data = doc.data() as FirestoreProduct;

    // Retrieve and collect every Cloudinary public ID associated with the product
    const publicIds = extractCloudinaryPublicIds(data);

    // Delete images from Cloudinary concurrently
    await deleteCloudinaryAssets(publicIds);

    // Delete database record
    console.log('Deleting database record');
    await docRef.delete();

    console.log('Product deleted successfully');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API] DELETE /api/products/:id failed:', err.message);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
