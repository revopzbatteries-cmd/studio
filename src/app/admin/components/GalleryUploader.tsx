"use client";

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, Star, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ProductGalleryImage } from '../types';

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_IMAGES = 8;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type UploadingEntry = {
  id: string;
  previewUrl: string;
  progress: 'uploading' | 'error';
  errorMsg?: string;
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface GalleryUploaderProps {
  images: ProductGalleryImage[];
  onChange: (images: ProductGalleryImage[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GalleryUploader({ images, onChange, onUploadingChange }: GalleryUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const totalSlots = images.length + uploading.length;
  const remaining = MAX_IMAGES - totalSlots;
  const canUploadMore = remaining > 0;

  useEffect(() => {
    if (onUploadingChange) {
      onUploadingChange(uploading.some(u => u.progress === 'uploading'));
    }
  }, [uploading, onUploadingChange]);

  // ── Upload logic ─────────────────────────────────────────────────────────

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const valid = files.filter(
        f => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024
      );
      const toUpload = valid.slice(0, MAX_IMAGES - imagesRef.current.length);
      if (!toUpload.length) return;

      // Immediately show blurred skeleton previews
      const entries: UploadingEntry[] = toUpload.map(f => ({
        id: uid(),
        previewUrl: URL.createObjectURL(f),
        progress: 'uploading' as const,
      }));
      setUploading(prev => [...prev, ...entries]);

      await Promise.all(
        toUpload.map(async (file, i) => {
          const entry = entries[i];
          try {
            const dataUrl = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onloadend = () => res(reader.result as string);
              reader.onerror = rej;
              reader.readAsDataURL(file);
            });

            const resp = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: dataUrl }),
            });
            const payload = await resp.json();
            if (!resp.ok || !payload.success) throw new Error(payload.message ?? 'Upload failed');

            const newImg: ProductGalleryImage = {
              id: entry.id,
              url: payload.imageUrl,
              publicId: payload.publicId,
              isMain: false,
            };

            // Remove this entry from uploading list
            setUploading(prev => prev.filter(u => u.id !== entry.id));
            URL.revokeObjectURL(entry.previewUrl);

            // Add to confirmed and call onChange
            const currentLatest = imagesRef.current;
            const updated = [...currentLatest, newImg];
            
            const hasMain = updated.some(x => x.isMain);
            const finalList = hasMain
              ? updated
              : updated.map((img, idx) => ({ ...img, isMain: idx === 0 }));

            imagesRef.current = finalList;
            onChange(finalList);
          } catch (err: any) {
            setUploading(prev =>
              prev.map(u =>
                u.id === entry.id
                  ? { ...u, progress: 'error' as const, errorMsg: err.message }
                  : u
              )
            );
          }
        })
      );
    },
    [onChange]
  );

  // ── Input / drag handlers ──────────────────────────────────────────────────

  const handleFiles = (files: FileList | null) => {
    if (!files || !canUploadMore) return;
    uploadFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // ── Gallery mutations ─────────────────────────────────────────────────────

  const setMain = (id: string) => {
    onChange(images.map(img => ({ ...img, isMain: img.id === id })));
  };

  const remove = (id: string) => {
    const updated = images.filter(img => img.id !== id);
    const hasMain = updated.some(img => img.isMain);
    const final = hasMain ? updated : updated.map((img, idx) => ({ ...img, isMain: idx === 0 }));
    onChange(final);
  };

  const dismissError = (id: string) => {
    setUploading(prev => prev.filter(u => u.id !== id));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const isEmpty = images.length === 0 && uploading.length === 0;

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Drop zone */}
      {canUploadMore && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={[
            'w-full flex flex-col items-center justify-center gap-3 py-8 rounded-xl border-2 border-dashed',
            'transition-all duration-200 cursor-pointer group select-none',
            dragOver
              ? 'border-primary/70 bg-primary/10 text-primary'
              : 'border-border/50 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          <div className={[
            'h-11 w-11 rounded-full flex items-center justify-center border transition-all duration-200',
            dragOver
              ? 'border-primary/40 bg-primary/20 text-primary'
              : 'border-border/40 bg-muted/50 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary',
          ].join(' ')}>
            <Upload size={20} />
          </div>
          <div className="text-center pointer-events-none">
            <p className="text-sm font-medium">
              {dragOver ? 'Drop images here' : isEmpty ? 'Click or drag to upload images' : 'Add more images'}
            </p>
            <p className="text-xs opacity-60 mt-0.5">
              JPG, PNG, WEBP · max {MAX_SIZE_MB} MB · {remaining} slot{remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </button>
      )}

      {/* Gallery grid */}
      {(images.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

          {/* Confirmed uploaded images */}
          {images.map(img => (
            <div
              key={img.id}
              className={[
                'relative group aspect-square rounded-xl overflow-hidden border-2 bg-muted/30 transition-all duration-200',
                img.isMain
                  ? 'border-primary ring-2 ring-primary/25 shadow-lg shadow-primary/10'
                  : 'border-border/40 hover:border-border/80',
              ].join(' ')}
            >
              <Image
                src={img.url}
                alt="Product"
                fill
                sizes="180px"
                className="object-cover"
              />

              {/* Main badge */}
              {img.isMain && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                  <Star size={8} />
                  Main
                </div>
              )}

              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center justify-center gap-2 p-2">
                {!img.isMain && (
                  <button
                    type="button"
                    onClick={() => setMain(img.id)}
                    className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg py-1.5 transition-colors"
                  >
                    <Star size={9} />
                    Set as Main
                  </button>
                )}
                {img.isMain && (
                  <div className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-primary/80 py-1">
                    <CheckCircle2 size={10} />
                    Main Image
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold bg-destructive/80 hover:bg-destructive text-white rounded-lg py-1.5 transition-colors"
                >
                  <X size={9} />
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* In-progress / error entries */}
          {uploading.map(entry => (
            <div
              key={entry.id}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-border/30 bg-muted/30"
            >
              <img
                src={entry.previewUrl}
                alt=""
                className="w-full h-full object-cover blur-sm scale-110 opacity-40"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/50">
                {entry.progress === 'uploading' ? (
                  <>
                    <Loader2 size={22} className="text-primary animate-spin" />
                    <span className="text-[10px] text-muted-foreground font-medium">Uploading…</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} className="text-destructive" />
                    <span className="text-[10px] text-destructive font-medium text-center px-2 leading-tight">
                      {entry.errorMsg ?? 'Upload failed'}
                    </span>
                    <button
                      type="button"
                      onClick={() => dismissError(entry.id)}
                      className="text-[10px] text-muted-foreground underline hover:text-foreground mt-0.5"
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary hint */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 size={11} className="text-green-500 shrink-0" />
          {images.length} image{images.length !== 1 ? 's' : ''} uploaded
          {images.find(i => i.isMain) ? ' · Main image selected' : ' · Hover an image to set as main'}
          {remaining > 0 && ` · ${remaining} slot${remaining !== 1 ? 's' : ''} remaining`}
        </p>
      )}
    </div>
  );
}
