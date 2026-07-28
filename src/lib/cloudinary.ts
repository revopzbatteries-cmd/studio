import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts all valid Cloudinary public IDs from a document or payload.
 * Supports:
 * - galleryImages: [{ publicId, ... }]
 * - images: [{ publicId, ... }]
 * - image: { publicId, ... } or string publicId
 * - imagePublicId: string
 * - publicId: string
 */
export function extractCloudinaryPublicIds(data: any): string[] {
  const ids = new Set<string>();

  if (!data) return [];

  // Check galleryImages array
  if (Array.isArray(data.galleryImages)) {
    for (const img of data.galleryImages) {
      if (typeof img === 'string' && img.trim()) {
        ids.add(img.trim());
      } else if (img && typeof img.publicId === 'string' && img.publicId.trim()) {
        ids.add(img.publicId.trim());
      }
    }
  }

  // Check images array
  if (Array.isArray(data.images)) {
    for (const img of data.images) {
      if (typeof img === 'string' && img.trim()) {
        ids.add(img.trim());
      } else if (img && typeof img.publicId === 'string' && img.publicId.trim()) {
        ids.add(img.publicId.trim());
      }
    }
  }

  // Check image object or string
  if (data.image) {
    if (typeof data.image === 'object' && typeof data.image.publicId === 'string' && data.image.publicId.trim()) {
      ids.add(data.image.publicId.trim());
    } else if (typeof data.image === 'string' && data.image.trim() && !data.image.startsWith('http')) {
      // In case publicId was stored directly in image field
      ids.add(data.image.trim());
    }
  }

  // Check single publicId fields
  if (typeof data.imagePublicId === 'string' && data.imagePublicId.trim()) {
    ids.add(data.imagePublicId.trim());
  }

  if (typeof data.publicId === 'string' && data.publicId.trim()) {
    ids.add(data.publicId.trim());
  }

  return Array.from(ids);
}

/**
 * Deletes an array of Cloudinary assets concurrently.
 * Handles failures gracefully without throwing errors to prevent blocking caller flows.
 */
export async function deleteCloudinaryAssets(publicIds: (string | null | undefined)[]): Promise<{
  deleted: string[];
  failed: { publicId: string; error: string }[];
}> {
  const validPublicIds = Array.from(
    new Set(
      (publicIds || []).filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    )
  );

  console.log(`Found ${validPublicIds.length} Cloudinary image${validPublicIds.length === 1 ? '' : 's'}`);

  if (validPublicIds.length === 0) {
    return { deleted: [], failed: [] };
  }

  console.log('Deleting:');
  validPublicIds.forEach(id => console.log(`- ${id}`));

  const deleted: string[] = [];
  const failed: { publicId: string; error: string }[] = [];

  await Promise.all(
    validPublicIds.map(async publicId => {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok' || result.result === 'not found') {
          deleted.push(publicId);
        } else {
          console.error(`Failed to delete Cloudinary image: ${publicId}`, result);
          failed.push({ publicId, error: result.result || 'Unknown result' });
        }
      } catch (error: any) {
        console.error(`Failed to delete Cloudinary image: ${publicId}`, error);
        failed.push({ publicId, error: error.message || String(error) });
      }
    })
  );

  console.log('Cloudinary cleanup completed');

  return { deleted, failed };
}

export default cloudinary;