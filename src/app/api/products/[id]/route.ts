// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdminAuth } from '@/lib/api-auth';
import type { FirestoreProduct, AdminProduct } from '@/app/admin/types';
import { adminToFirestore } from '@/app/admin/types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdminAuth(request as any, []);
  if (error) return error;
  try {
    const doc = await adminDb.collection('products').doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    const product = { id: doc.id, ...doc.data() } as FirestoreProduct;
    return NextResponse.json(product);
  } catch (err: any) {
    console.error('[API] GET /api/products/:id failed:', err.message);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error, adminProfile } = await requireAdminAuth(request as any, ['manager', 'product_manager']);
  if (error) return error;
  try {
    const body = await request.json();
    const adminProduct: AdminProduct = body;
    const firestoreData = adminToFirestore(adminProduct);
    await adminDb.collection('products').doc(params.id).set(firestoreData, { merge: true });
    const updatedDoc = await adminDb.collection('products').doc(params.id).get();
    const updated = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreProduct;
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[API] PUT /api/products/:id failed:', err.message);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { error, adminProfile } = await requireAdminAuth(request as any, ['manager']);
  if (error) return error;
  try {
    const docRef = adminDb.collection('products').doc(params.id);
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    const data = doc.data() as FirestoreProduct;
    // Delete Cloudinary asset if publicId present
    if (data.imagePublicId) {
      try {
        const cloudinary = (await import('@/lib/cloudinary')).default;
        await cloudinary.uploader.destroy(data.imagePublicId);
      } catch (cErr) {
        console.warn('[API] Cloudinary cleanup failed:', cErr);
      }
    }
    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API] DELETE /api/products/:id failed:', err.message);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
