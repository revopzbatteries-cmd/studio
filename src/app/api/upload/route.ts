import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireAdminAuth } from '@/lib/api-auth';

export async function POST(req: Request) {
    console.log("[Upload Endpoint] POST /api/upload called");
    const cookies = req.headers.get('cookie') || '';
    const authHeader = req.headers.get('authorization') || '';
    console.log("[Upload Endpoint] Cookies:", cookies ? "Present" : "None");
    console.log("[Upload Endpoint] Authorization header:", authHeader ? `${authHeader.substring(0, 15)}...` : "None");

    // Verify Cloudinary configuration environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log("[Upload Endpoint] Cloudinary config status:", {
        cloudName: cloudName ? "Set" : "MISSING",
        apiKey: apiKey ? "Set" : "MISSING",
        apiSecret: apiSecret ? "Set" : "MISSING",
    });

    if (!cloudName || !apiKey || !apiSecret) {
        console.error("[Upload Endpoint] Missing required Cloudinary environment variables!");
    }

    // Protect upload endpoint: only allow managers and product managers to upload images
    const { error: authError, adminProfile, uid } = await requireAdminAuth(req as any, ['manager', 'product_manager']);

    if (authError) {
        console.warn("[Upload Endpoint] Authentication failed for /api/upload route");
        return authError;
    }

    console.log("[Upload Endpoint] Authentication successful!");
    console.log("[Upload Endpoint] Authenticated user:", adminProfile?.email || uid);
    console.log("[Upload Endpoint] User role:", adminProfile?.role);

    try {
        const body = await req.json();

        if (!body.image) {
            console.warn("[Upload Endpoint] Missing image payload in request body");
            return NextResponse.json(
                { success: false, reason: "Missing image in request body", message: "No image provided" },
                { status: 400 }
            );
        }

        console.log("[Upload Endpoint] Reaching cloudinary.uploader.upload(...) for folder revopz/products");
        const uploaded = await cloudinary.uploader.upload(body.image, {
            folder: 'revopz/products',
        });

        console.log("[Upload Endpoint] Cloudinary upload successful. Public ID:", uploaded.public_id);

        return NextResponse.json({
            success: true,
            imageUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
        });
    } catch (error: any) {
        console.error("[Upload Endpoint] Cloudinary upload error:", error);

        return NextResponse.json(
            { success: false, reason: `Upload failure: ${error.message || 'Unknown error'}`, message: 'Upload failed' },
            { status: 500 }
        );
    }
}