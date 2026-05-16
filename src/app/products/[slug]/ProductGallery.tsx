"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ImageIcon, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GalleryImage {
  url: string;
  isMain: boolean;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const mainIndex = images.findIndex(img => img.isMain);
  const [activeIndex, setActiveIndex] = useState(mainIndex >= 0 ? mainIndex : 0);
  
  // ── Zoom State ──
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[activeIndex] : null;
  const hasMultiple = images.length > 1;

  // ── Zoom Handlers ──
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (window.innerWidth < 1024) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPos({ x, y });
  };

  return (
    <div className="space-y-8">
      {/* ── Main Stage ── */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => window.innerWidth >= 1024 && setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        className="relative aspect-[4/5] md:aspect-square w-full rounded-[2.5rem] overflow-hidden border border-border/40 bg-card/30 backdrop-blur-md flex items-center justify-center group cursor-zoom-in"
      >
        {activeImage ? (
          <>
            {/* Immersive Background Shadow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
            
            {/* Hero Image */}
            <div className={`relative w-full h-full p-8 md:p-16 transition-all duration-700 ease-out ${isZoomed ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
              <Image
                key={activeImage.url}
                src={activeImage.url}
                alt={productName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-700"
              />
            </div>

            {/* Premium Magnifier (Desktop) */}
            {isZoomed && (
              <div 
                className="absolute inset-0 pointer-events-none z-10 hidden lg:block animate-in fade-in duration-300"
                style={{
                  backgroundImage: `url(${activeImage.url})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundSize: '250%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            )}

            {/* Interaction Hints */}
            <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
              <div className="h-10 w-10 rounded-full bg-background/30 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <ZoomIn size={18} />
              </div>
            </div>
          </>
        ) : (
          <ImageIcon size={80} className="text-muted-foreground/20" />
        )}
      </div>

      {/* ── High-end Thumbnails ── */}
      {hasMultiple && (
        <div className="flex justify-center gap-4 px-2">
          <div className="flex gap-4 p-3 rounded-3xl bg-card/20 backdrop-blur-xl border border-border/30 overflow-x-auto no-scrollbar scroll-smooth">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`
                  relative flex-shrink-0 h-20 w-20 rounded-2xl overflow-hidden transition-all duration-500
                  ${i === activeIndex 
                    ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-background scale-105 shadow-xl shadow-blue-500/20' 
                    : 'opacity-40 hover:opacity-80 border border-white/5 grayscale hover:grayscale-0'
                  }
                `}
              >
                <Image
                  src={img.url}
                  alt={`${productName} view ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
