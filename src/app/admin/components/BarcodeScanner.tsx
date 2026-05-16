"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (value: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (open) {
      // Small delay to ensure the div is in the DOM
      const timer = setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            "reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 150 },
              aspectRatio: 1.0,
              formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
              ]
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              onScan(decodedText);
              scanner.clear();
              onOpenChange(false);
            },
            (errorMessage) => {
              // We don't want to show every scanning failure
            }
          );

          scannerRef.current = scanner;
        } catch (err: any) {
          console.error("Scanner init failed", err);
          setError(err.message || "Could not initialize camera scanner.");
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(e => console.warn("Scanner clear failed", e));
        }
      };
    }
  }, [open, onOpenChange, onScan]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card sm:max-w-md p-0 overflow-hidden border-border/40">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-headline">
            <Camera className="text-primary" size={20} />
            Scan Serial Number
          </DialogTitle>
          <DialogDescription>
            Position the barcode or QR code within the frame to scan automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-border/40">
            {error ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <X className="mb-2 text-destructive" size={40} />
                <p className="text-sm font-medium text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => { setError(null); onOpenChange(false); }}
                >
                  Close
                </Button>
              </div>
            ) : (
              <div id="reader" className="w-full h-full [&_video]:object-cover [&_video]:h-full [&_video]:w-full" />
            )}
            
            {!error && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-40 border-2 border-primary/50 rounded-lg bg-primary/5 animate-pulse" />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>

        <style jsx global>{`
          #reader { border: none !important; }
          #reader__dashboard { background: transparent !important; border: none !important; padding: 0 !important; }
          #reader__status_span { display: none !important; }
          #reader__camera_selection { 
            background: rgba(15, 23, 42, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: white !important;
            border-radius: 6px !important;
            padding: 4px 8px !important;
            font-size: 12px !important;
            margin-bottom: 12px !important;
            width: 100% !important;
          }
          #reader button {
            background: hsl(var(--primary)) !important;
            color: hsl(var(--primary-foreground)) !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 8px 16px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: opacity 0.2s !important;
          }
          #reader button:hover { opacity: 0.9 !important; }
          #reader__scan_region { display: flex !important; align-items: center !important; justify-content: center !important; }
          #reader__scan_region img { display: none !important; }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
