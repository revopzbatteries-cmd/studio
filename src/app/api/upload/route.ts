import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: Request) {
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