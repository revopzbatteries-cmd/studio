import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireAdminAuth } from '@/lib/api-auth';

export async function POST(req: Request) {
    // Protect upload endpoint: only allow managers and product managers to upload images
    const { error: authError } = await requireAdminAuth(req as any, ['manager', 'product_manager']);
    if (authError) return authError;

    try {
        const body = await req.json();

        const uploaded = await cloudinary.uploader.upload(body.image, {
            folder: 'revopz/products',
        });

        return NextResponse.json({
            success: true,
            imageUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { success: false, message: 'Upload failed' },
            { status: 500 }
        );
    }
}