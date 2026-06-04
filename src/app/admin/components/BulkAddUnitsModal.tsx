"use client";

import { useState, useMemo, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Factory, 
  Plus, 
  QrCode, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  FileText,
  ListPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/app/admin/components/BarcodeScanner';
import { 
  bulkAddManufacturedUnits, 
  type ManufacturedUnitCategory 
} from '@/lib/manufacturedUnits';
import { normalizeProductNumber } from '@/lib/validations';
import type { FirestoreProduct } from '@/app/admin/types';
import type { AdminProfile } from '@/lib/adminService';

interface BulkAddUnitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: FirestoreProduct[];
  isFetchingProducts: boolean;
  adminProfile: AdminProfile;
}

export function BulkAddUnitsModal({ 
  open, 
  onOpenChange, 
  products, 
  isFetchingProducts,
  adminProfile 
}: BulkAddUnitsModalProps) {
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [category, setCategory] = useState<ManufacturedUnitCategory>('Other');
  const [warrantyMonths, setWarrantyMonths] = useState<number>(60);
  const [serialInput, setSerialInput] = useState<string>('');
  const [manufacturedDate, setManufacturedDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastScannedValue, setLastScannedValue] = useState<string | null>(null);

  // Derive product details when selection changes
  const handleProductChange = (val: string) => {
    setSelectedProduct(val);
    const p = products.find(prod => prod.name === val);
    if (p) {
      const pCat = p.category?.toLowerCase() || '';
      let mappedCat: ManufacturedUnitCategory = 'Other';
      if (pCat.includes('inverter')) mappedCat = 'Inverter';
      else if (pCat.includes('batter')) mappedCat = 'Battery';
      else if (pCat.includes('system') || pCat.includes('solar')) mappedCat = 'Solar';
      
      setCategory(mappedCat);
      setWarrantyMonths(p.warrantyMonths || 60);
    }
  };

  // Parse and sanitize serial numbers
  const serials = useMemo(() => {
    return serialInput
      .split(/[\n,]/)
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
  }, [serialInput]);

  const uniqueSerials = useMemo(() => Array.from(new Set(serials)), [serials]);
  const duplicateCount = serials.length - uniqueSerials.length;

  const handleScan = (val: string) => {
    setLastScannedValue(val);
  };

  useEffect(() => {
    if (!lastScannedValue) return;

    const normalized = lastScannedValue.trim().toUpperCase();
    if (normalized) {
      let isDuplicate = false;
      
      setSerialInput(prev => {
        const lines = prev.trim() ? prev.split('\n').map(l => l.trim().toUpperCase()) : [];
        if (lines.includes(normalized)) {
          isDuplicate = true;
          return prev;
        }
        return prev.trim() ? `${prev.trim()}\n${normalized}` : normalized;
      });

      if (isDuplicate) {
        toast({ 
          title: "Duplicate Scan", 
          description: `${normalized} is already in the list.`, 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Unit Scanned", 
          description: normalized 
        });
      }
    }
    
    // Clear the scanned value to prevent re-triggering
    setLastScannedValue(null);
  }, [lastScannedValue, toast]);

  const handleCreate = async () => {
    if (!selectedProduct) {
      toast({ title: "Product Required", description: "Please select a product model.", variant: "destructive" });
      return;
    }
    if (uniqueSerials.length === 0) {
      toast({ title: "Serials Required", description: "Please enter at least one serial number.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const inputs = uniqueSerials.map(sn => ({
        productName: selectedProduct,
        productNumber: normalizeProductNumber(sn),
        category,
        manufacturedDate,
        warrantyMonths,
        status: 'Ready' as const,
        createdBy: adminProfile.uid,
        createdByName: adminProfile.name,
        createdByRole: adminProfile.role,
      }));

      const result = await bulkAddManufacturedUnits(inputs);
      
      toast({ 
        title: "Bulk Add Successful", 
        description: `${result.successCount} units have been created.` 
      });
      
      onOpenChange(false);
      // Reset form
      setSerialInput('');
      setSelectedProduct('');
    } catch (err: any) {
      toast({ 
        title: "Creation Failed", 
        description: err.message || "Failed to create units.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-border/40">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-headline flex items-center gap-2">
            <ListPlus className="text-primary" size={22} /> Bulk Add Manufactured Units
          </DialogTitle>
          <DialogDescription>
            Register multiple units of the same product model in one batch.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Section 1: Product Details */}
          <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Factory size={14} /> Product Selection
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs text-muted-foreground uppercase">Product Model</Label>
                <Select onValueChange={handleProductChange} value={selectedProduct}>
                  <SelectTrigger className="bg-background/50 border-border/60">
                    <SelectValue placeholder={isFetchingProducts ? "Loading products..." : "Select a product model"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-60">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                            {p.category} • {p.powerRating || p.power} • {p.warrantyMonths || 60}M Warranty
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase font-semibold">Category</Label>
                <Input value={category} readOnly disabled className="bg-background/30 border-border/40 opacity-70" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase font-semibold">Warranty (Months)</Label>
                <Input value={warrantyMonths} readOnly disabled className="bg-background/30 border-border/40 opacity-70" />
              </div>
            </div>
          </div>

          {/* Section 2: Serial Numbers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText size={14} /> Serial Numbers / Product Numbers
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                  {uniqueSerials.length} UNITS
                </span>
                {duplicateCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                    {duplicateCount} DUPLICATES REMOVED
                  </span>
                )}
              </div>
            </div>

            <div className="relative group">
              <Textarea 
                placeholder="Paste serial numbers here...&#10;RZ123-001&#10;RZ123-002"
                className="min-h-[160px] font-mono text-sm bg-background/50 border-border/60 focus:border-primary/50 resize-none p-4"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute bottom-3 right-3 h-10 w-10 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg rounded-xl"
                onClick={() => setIsScannerOpen(true)}
                title="Continuous Scan"
              >
                <QrCode size={20} />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              * Support new line or comma separation. Automatically sanitized.
            </p>
          </div>

          {/* Section 3: Shared Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase font-semibold">Manufactured Date</Label>
              <Input 
                type="date" 
                value={manufacturedDate}
                onChange={(e) => setManufacturedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="bg-background/50 border-border/60 focus:border-primary/50" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase font-semibold">Initial Status</Label>
              <Input value="Ready" readOnly disabled className="bg-background/30 border-border/40 opacity-70" />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-border/40 bg-muted/20">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white px-8 gap-2 shadow-lg shadow-primary/20"
            onClick={handleCreate}
            disabled={isSubmitting || uniqueSerials.length === 0 || !selectedProduct}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating Units...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Create {uniqueSerials.length} Units
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Barcode Scanner Integration */}
        <BarcodeScanner 
          open={isScannerOpen} 
          onOpenChange={setIsScannerOpen}
          onScan={handleScan}
        />
      </DialogContent>
    </Dialog>
  );
}
