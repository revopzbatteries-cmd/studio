"use client";

import { useRef, useState } from 'react';
import { Upload, X, ImageIcon, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

import { auth } from '@/lib/firebase';

export interface ImageUploadResult {
  url: string;
  publicId: string;
}

interface ImageUploaderProps {
  /** Current Cloudinary URL (empty string = no image yet) */
  value: string;
  /** Called with { url, publicId } after a successful Cloudinary upload */
  onChange: (result: ImageUploadResult) => void;
  /** Called when the user removes the current image */
  onRemove?: () => void;
  error?: string;
}

export function ImageUploader({ value, onChange, onRemove, error }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED.includes(file.type)) {
      setUploadError('Only JPG, PNG, WEBP, and GIF images are allowed.');
      return;
    }

    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5 MB.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      // Read file as base64 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Fetch Firebase ID Token for authentication
      const idToken = await auth.currentUser?.getIdToken();

      // Upload to Cloudinary via our backend route
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ image: dataUrl }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.reason ?? payload.message ?? payload.error ?? 'Upload failed. Please try again.');
      }

      onChange({ url: payload.imageUrl, publicId: payload.publicId });
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset so user can re-upload the same file if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onRemove?.();
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadError('');
  };

  const triggerUpload = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const displayError = uploadError || error;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">
        Product Image
      </Label>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
      />

      {!value ? (
        /* ── Upload zone ─────────────────────────────────────────────── */
        <button
          type="button"
          onClick={triggerUpload}
          disabled={isUploading}
          className={[
            'flex flex-col items-center justify-center gap-3 w-full py-10 rounded-xl border-2 border-dashed',
            'text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer group',
            'disabled:cursor-not-allowed disabled:opacity-60',
            displayError
              ? 'border-destructive/60 bg-destructive/5'
              : 'border-border/50 hover:border-primary/40 hover:bg-primary/5',
          ].join(' ')}
        >
          <div className={[
            'h-12 w-12 rounded-full flex items-center justify-center border transition-all duration-200',
            isUploading
              ? 'border-primary/30 bg-primary/10 text-primary'
              : displayError
              ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : 'border-border/40 bg-muted/50 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary',
          ].join(' ')}>
            {isUploading
              ? <Loader2 size={22} className="animate-spin" />
              : <Upload size={22} />
            }
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isUploading ? 'Uploading to Cloudinary…' : 'Click to upload image'}
            </p>
            <p className="text-xs opacity-60 mt-0.5">JPG, PNG, WEBP · max 5 MB</p>
          </div>
        </button>
      ) : (
        /* ── Preview ─────────────────────────────────────────────────── */
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-primary/20 bg-muted/20 group">
          <img
            src={value}
            alt="Product preview"
            className="w-full h-full object-contain"
          />

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={triggerUpload}
              disabled={isUploading}
              className="flex items-center gap-2 text-xs bg-background/90 border border-border px-3 py-2 rounded-lg hover:bg-background hover:border-primary/50 hover:text-primary transition-all disabled:opacity-60"
            >
              {isUploading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {isUploading ? 'Uploading…' : 'Change'}
            </button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-xs h-8 px-3"
            >
              <X size={13} className="mr-1" />
              Remove
            </Button>
          </div>

          {/* Corner badge — shows Cloudinary status */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border border-border/60 rounded-md px-2 py-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 size={11} className="text-green-500" />
            Cloudinary
          </div>
        </div>
      )}

      {displayError && (
        <p className="text-xs text-destructive flex items-center gap-1.5 mt-1">
          <AlertTriangle size={11} />
          {displayError}
        </p>
      )}
    </div>
  );
}
