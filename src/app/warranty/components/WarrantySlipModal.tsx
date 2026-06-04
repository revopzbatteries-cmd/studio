'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X, ShieldCheck } from 'lucide-react';
import { WarrantySlipTemplate } from './WarrantySlipTemplate';
import SlipActions from '../slip/[registrationId]/SlipActions';

interface WarrantySlipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
}

export function WarrantySlipModal({ open, onOpenChange, registrationId }: WarrantySlipModalProps) {
  const [warranty, setWarranty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && registrationId) {
      fetchWarranty();
    }
  }, [open, registrationId]);

  const fetchWarranty = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/warranty/${registrationId}`);
      if (!res.ok) throw new Error('Failed to fetch warranty details');
      const data = await res.json();
      setWarranty(data);
    } catch (err: any) {
      console.error('[WarrantySlipModal] Error:', err);
      setError(err.message || 'Could not load warranty slip.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-card border-border">
        <DialogHeader className="p-6 pb-2 border-b border-border flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
              <ShieldCheck className="text-primary" size={24} /> Official Warranty Slip
            </DialogTitle>
            <DialogDescription>
              Registration ID: {registrationId}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-4">
            {warranty && !isLoading && !error && (
              <div className="hidden sm:block">
                <SlipActions filename={`REVOPZ-Warranty-${warranty.serialNumber}.pdf`} />
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-muted-foreground animate-pulse">Fetching official documentation...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="text-destructive" size={32} />
              </div>
              <h3 className="text-xl font-bold font-headline">Unable to Load Slip</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">{error}</p>
              <Button onClick={fetchWarranty}>Try Again</Button>
            </div>
          ) : (
            <div className="max-w-[800px] mx-auto shadow-2xl">
              <WarrantySlipTemplate warranty={warranty} />
            </div>
          )}
        </div>

        {/* Mobile footer actions */}
        <div className="sm:hidden p-4 border-t border-border bg-card flex justify-center">
          {warranty && !isLoading && !error && (
            <SlipActions filename={`REVOPZ-Warranty-${warranty.serialNumber}.pdf`} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
