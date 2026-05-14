"use client";

import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

/**
 * Validates that an image URL is a real, usable HTTPS URL.
 * Rejects null, empty, placeholder strings, and malformed URLs.
 */
function isValidProductImage(url?: string | null): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol.startsWith('http') &&
      !url.includes('your-image-url.com') &&
      !url.includes('example.com')
    );
  } catch {
    return false;
  }
}

interface ProductThumbnailProps {
  imageUrl?: string | null;
  name: string;
  /** Size in pixels — defaults to 64 (h-16 w-16) */
  size?: number;
}

/**
 * A production-ready product thumbnail for the admin table.
 * – Uses next/image for optimised delivery.
 * – Shows an icon placeholder when the URL is missing or invalid.
 * – Catches runtime load errors gracefully so layout never breaks.
 */
export function ProductThumbnail({ imageUrl, name, size = 64 }: ProductThumbnailProps) {
  const [loadError, setLoadError] = useState(false);
  const valid = isValidProductImage(imageUrl) && !loadError;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-muted/40 flex-shrink-0"
      style={{ width: size, height: size, minWidth: size }}
    >
      {valid ? (
        <Image
          src={imageUrl!}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover transition-transform duration-300 hover:scale-105"
          onError={() => setLoadError(true)}
          unoptimized={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="text-muted-foreground/50" size={Math.round(size * 0.3)} />
        </div>
      )}
    </div>
  );
}
