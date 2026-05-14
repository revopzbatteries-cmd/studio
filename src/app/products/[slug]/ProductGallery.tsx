"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
  url: string;
  isMain: boolean;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  // Start with the main image selected; fall back to index 0
  const mainIndex = images.findIndex(img => img.isMain);
  const [activeIndex, setActiveIndex] = useState(mainIndex >= 0 ? mainIndex : 0);

  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[activeIndex] : null;
  const hasMultiple = images.length > 1;

  const prev = () => setActiveIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex(i => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Hero image ── */}
      <div className="relative aspect-square lg:h-[540px] w-full rounded-3xl overflow-hidden border border-border/60 bg-card/50 flex items-center justify-center group">
        {activeImage ? (
          <>
            <Image
              key={activeImage.url}
              src={activeImage.url}
              alt={productName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6 md:p-10 transition-opacity duration-300"
            />

            {/* Prev / next arrows — only when multiple */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-label={`View image ${i + 1}`}
                      className={[
                        'h-1.5 rounded-full transition-all duration-200',
                        i === activeIndex
                          ? 'w-5 bg-primary'
                          : 'w-1.5 bg-foreground/30 hover:bg-foreground/50',
                      ].join(' ')}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <ImageIcon size={80} className="text-muted-foreground/20" />
        )}
      </div>

      {/* ── Thumbnail strip (only when > 1 image) ── */}
      {hasMultiple && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Select image ${i + 1}`}
              className={[
                'relative flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all duration-150',
                i === activeIndex
                  ? 'border-primary ring-2 ring-primary/25 shadow-md shadow-primary/10'
                  : 'border-border/40 hover:border-border opacity-60 hover:opacity-100',
              ].join(' ')}
            >
              <Image
                src={img.url}
                alt={`${productName} view ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
