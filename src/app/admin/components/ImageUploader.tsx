"use client";

import { useRef } from 'react';
import { Upload, X, ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (base64: string) => void;
  error?: string;
}

export function ImageUploader({ value, onChange, error }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">Product Image</Label>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
      />

      {!value ? (
        /* Upload zone */
        <button
          type="button"
          onClick={triggerUpload}
          className={[
            'flex flex-col items-center justify-center gap-3 w-full py-10 rounded-xl border-2 border-dashed',
            'text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer group',
            error
              ? 'border-destructive/60 bg-destructive/5'
              : 'border-border/50 hover:border-primary/40 hover:bg-primary/5',
          ].join(' ')}
        >
          <div className={[
            'h-12 w-12 rounded-full flex items-center justify-center border transition-all duration-200',
            error
              ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : 'border-border/40 bg-muted/50 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary',
          ].join(' ')}>
            <Upload size={22} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Click to upload image</p>
            <p className="text-xs opacity-60 mt-0.5">JPG, PNG, WEBP supported</p>
          </div>
        </button>
      ) : (
        /* Preview */
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
              className="flex items-center gap-2 text-xs bg-background/90 border border-border px-3 py-2 rounded-lg hover:bg-background hover:border-primary/50 hover:text-primary transition-all"
            >
              <RefreshCw size={13} />
              Change
            </button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="text-xs h-8 px-3"
            >
              <X size={13} className="mr-1" />
              Remove
            </Button>
          </div>
          {/* Corner badge */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border border-border/60 rounded-md px-2 py-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ImageIcon size={11} />
            Preview
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1.5 mt-1">
          <AlertTriangle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
