// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdminAuth } from '@/lib/api-auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { FirestoreProduct, AdminProduct } from '@/app/admin/types';
import { adminToFirestore } from '@/app/admin/types';

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
      const oldPublicIds = (oldData.galleryImages ?? []).map(g => g.publicId).filter(Boolean);
      const newPublicIds = (body.galleryImages ?? []).map((g: any) => g.publicId).filter(Boolean);
      const removedIds = oldPublicIds.filter(pid => !newPublicIds.includes(pid));

      if (removedIds.length > 0) {
        try {
          const cloudinary = (await import('@/lib/cloudinary')).default;
          await Promise.all(
            removedIds.map(publicId =>
              cloudinary.uploader.destroy(publicId).catch(err =>
                console.warn(`[API] Cloudinary cleanup failed for ${publicId}:`, err)
              )
            )
          );
        } catch (cErr) {
          console.warn('[API] Failed to initialize Cloudinary for cleanup:', cErr);
        }
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
  try {
    const docRef = adminDb.collection('products').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    const data = doc.data() as FirestoreProduct;

    // ── Delete every Cloudinary asset ─────────────────────────────────────────
    const cloudinary = (await import('@/lib/cloudinary')).default;

    const galleryAssets: string[] = (data.galleryImages ?? [])
      .map((g: any) => g.publicId)
      .filter(Boolean);

    const legacyId = data.imagePublicId;
    if (legacyId && !galleryAssets.includes(legacyId)) galleryAssets.push(legacyId);

    if (galleryAssets.length > 0) {
      await Promise.all(
        galleryAssets.map(publicId =>
          cloudinary.uploader.destroy(publicId).catch(err =>
            console.warn(`[API] Cloudinary cleanup failed for ${publicId}:`, err)
          )
        )
      );
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API] DELETE /api/products/:id failed:', err.message);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
