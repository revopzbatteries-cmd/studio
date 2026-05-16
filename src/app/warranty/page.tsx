"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Search, Loader2, CheckCircle2, AlertCircle,
  Package, User, Phone, Mail, MapPin, Tag, XCircle, ClipboardCheck,
  ShieldOff, RefreshCw, CalendarDays, Lock, ShieldAlert, AlertTriangle, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getManufacturedUnit } from '@/lib/manufacturedUnits';
import { WarrantySlipModal } from './components/WarrantySlipModal';

// ── Types ────────────────────────────────────────────────────────────────────
type WarrantyStatus = 'not_registered' | 'active' | 'expired';

interface Product {
  serial: string;
  name: string;
  model: string;
  category: string;
  warrantyStatus: WarrantyStatus;
  purchaseDate?: string;
  expiryDate?: string;
  registrationId?: string;
}

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Validation helpers ────────────────────────────────────────────────────────
const isValidPhone = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: WarrantyStatus }) {
  if (status === 'active')
    return <Badge className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1">✅ Active</Badge>;
  if (status === 'expired')
    return <Badge className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1">❌ Expired</Badge>;
  return <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-3 py-1">⚠ Not Registered</Badge>;
}

// ── Chip label map ────────────────────────────────────────────────────────────
const chipLabel: Record<WarrantyStatus, string> = {
  not_registered: 'Not Registered',
  active: 'Active',
  expired: 'Expired',
};

const chipColors: Record<WarrantyStatus, string> = {
  not_registered: 'border-amber-500/60 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
  active: 'border-green-500/60 bg-green-500/10 text-green-400 hover:bg-green-500/20',
  expired: 'border-red-500/60 bg-red-500/10 text-red-400 hover:bg-red-500/20',
};

// ─────────────────────────────────────────────────────────────────────────────
export default function WarrantyPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ── Mock product data ──────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([
    {
      serial: 'RZ1100-001',
      name: 'RZ 1100+',
      model: '1100VA / 12V',
      category: 'Inverter',
      warrantyStatus: 'not_registered',
      purchaseDate: '2024-06-15',
    },
    {
      serial: 'RZ1350-002',
      name: 'RZ 1350+',
      model: '1350VA / 12V',
      category: 'Inverter',
      warrantyStatus: 'active',
      purchaseDate: '2024-01-10',
      expiryDate: '2026-01-10',
    },
    {
      serial: 'RZ200AH-003',
      name: 'RZ 200Ah Battery',
      model: '12V / 200Ah',
      category: 'Battery',
      warrantyStatus: 'expired',
      purchaseDate: '2022-01-10',
      expiryDate: '2024-01-10',
    },
  ]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFakeProduct, setIsFakeProduct] = useState(false);
  const [fakeReason, setFakeReason] = useState('');

  // register modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', phone: '', otp: '', email: '', address: '' });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // complaint
  const [isComplaintLoading, setIsComplaintLoading] = useState(false);

  // contact support modal
  const [showContactModal, setShowContactModal] = useState(false);

  // warranty slip modal
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  // ── Body scroll lock when any modal is open ──────────────────────────
  useEffect(() => {
    const anyOpen = isRegisterOpen || showContactModal;
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isRegisterOpen, showContactModal]);

  // ── Chip click → autofill + search ────────────────────────────────────────
  const handleChipClick = (serial: string) => {
    setInputValue(serial);
    triggerSearch(serial);
  };

  // ── Core search logic ──────────────────────────────────────────────────────
  const triggerSearch = async (serial: string) => {
    if (!serial.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    setSelectedProduct(null);
    setIsFakeProduct(false);
    setFakeReason('');

    try {
      const res = await fetch(`/api/warranty/search?serial=${encodeURIComponent(serial)}`, { cache: 'no-store' });
      const data = await res.json();

      if (!data.found) {
        setSelectedProduct(null);
      } else if (data.status === 'fake_product') {
        setIsFakeProduct(true);
        setFakeReason(data.reason || '');
        setSelectedProduct(null);
      } else if (data.source === 'manufactured_unit') {
        setSelectedProduct({
          serial: data.data.productNumber,
          name: data.data.productName,
          model: data.data.productName, // model defaults to productName if not separate
          category: data.data.category,
          warrantyStatus: 'not_registered',
        });
      } else if (data.source === 'warranty') {
        setSelectedProduct({
          serial: data.data.serialNumber,
          name: data.data.productName,
          model: data.data.model || data.data.productName,
          category: data.data.category,
          warrantyStatus: data.status, // 'active' | 'expired'
          purchaseDate: data.data.installationDate,
          expiryDate: data.data.warrantyEndDate,
          registrationId: data.data.registrationId,
        });
      }
    } catch (err) {
      console.error('[Warranty] Search failed:', err);
      setSelectedProduct(null);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(inputValue);
  };

  // ── Register form helpers ──────────────────────────────────────────────────
  const validateReg = () => {
    const errs: Record<string, string> = {};
    if (!regForm.name.trim()) errs.name = 'Name is required.';
    if (!isValidPhone(regForm.phone)) errs.phone = 'Enter a valid 10-digit phone number.';
    if (!regForm.otp.trim()) errs.otp = 'Please enter the OTP.';
    if (!isValidEmail(regForm.email)) errs.email = 'Enter a valid email address.';
    if (!regForm.address.trim()) errs.address = 'Address is required.';
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReg() || !selectedProduct) return;

    setIsRegistering(true);
    try {
      const payload = {
        customerName: regForm.name,
        customerPhone: regForm.phone,
        customerEmail: regForm.email,
        address: regForm.address,
        serialNumber: selectedProduct.serial,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        model: selectedProduct.model,
      };

      const res = await fetch('/api/warranty/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to register warranty');

      // Compute a 2-year expiry from today for newly registered products (or rely on backend if we refetch)
      // Since backend already computed it, we can just do a local update or refetch. 
      console.log("[Warranty Registration] Saving warranty:", selectedProduct.serial);
      console.log("[Warranty Registration] Updating manufactured unit");
      
      // For immediate UI feedback, we just do a refetch of the search API.
      await triggerSearch(selectedProduct.serial);
      
      router.refresh();

      setIsRegisterOpen(false);
      setRegForm({ name: '', phone: '', otp: '', email: '', address: '' });
      setRegErrors({});

      toast({
        title: '🎉 Warranty Registered!',
        description: `${selectedProduct.name} is now covered under active warranty.`,
      });

      // Open official slip in new tab
      window.open(`/warranty/slip/${data.registrationId}`, '_blank');
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // ── Raise complaint ────────────────────────────────────────────────────────
  const handleRaiseComplaint = () => {
    setIsComplaintLoading(true);
    setTimeout(() => {
      setIsComplaintLoading(false);
      toast({
        title: '✅ Complaint Registered',
        description: 'Our technician will contact you shortly.',
      });
    }, 1200);
  };

  // ── Contact Support (mobile → dialer, desktop → modal) ───────────────────
  const handleContactSupport = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      window.location.href = 'tel:+919746804951';
    } else {
      setShowContactModal(true);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-[900px]">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4 mb-16">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Warranty &amp; Support</h1>
          <p className="text-muted-foreground text-lg">Check your product status and manage your warranty online.</p>
        </div>

        {/* ── Search card ───────────────────────────────────────────────── */}
        <Card className="bg-card border-primary/20 shadow-xl mb-6 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              <Search className="text-primary" size={24} /> Check Your Warranty
            </CardTitle>
            <CardDescription>Enter the serial number found on your REVOPZ unit.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="serial-input"
                  placeholder="e.g. RZ1350-002"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="h-12 bg-muted/50 text-base uppercase font-mono"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90" disabled={isSearching}>
                {isSearching ? <Loader2 className="animate-spin mr-2" size={18} /> : <Search size={18} className="mr-2" />}
                {isSearching ? 'Checking…' : 'Check Status'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Demo chips ──────────────────────────────────────────────────
        <div className="mb-12 p-5 rounded-2xl border border-dashed border-primary/25 bg-primary/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            🧪 Demo Product Numbers — click to test instantly
          </p>
          <div className="flex flex-wrap gap-3">
            {products.map(p => (
              <button
                key={p.serial}
                type="button"
                onClick={() => handleChipClick(p.serial)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-mono font-semibold transition-all duration-200 cursor-pointer ${chipColors[p.warrantyStatus]}`}
              >
                <span>{p.serial}</span>
                <span className="text-xs font-normal opacity-75">({chipLabel[p.warrantyStatus]})</span>
              </button>
            ))}
          </div>
        </div> */}

        {/* ── Results ───────────────────────────────────────────────────── */}
        {hasSearched && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* FAKE PRODUCT WARNING */}
            {isFakeProduct && (
              <div className="rounded-3xl overflow-hidden border-2 border-red-700/60 bg-red-950/30">
                <div className="bg-red-700/20 border-b border-red-700/30 px-8 py-5 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-red-700/30 flex items-center justify-center shrink-0">
                    <ShieldAlert size={28} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400/80 mb-0.5">Security Alert</p>
                    <h3 className="text-2xl font-bold font-headline text-red-300">Counterfeit Product Detected</h3>
                  </div>
                </div>
                <div className="px-8 py-7 space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    This serial number{' '}
                    <span className="font-mono font-bold text-red-300 bg-red-900/30 px-2 py-0.5 rounded">
                      {inputValue.trim().toUpperCase()}
                    </span>{' '}
                    has been flagged as a <span className="text-red-400 font-semibold">non-genuine REVOPZ product</span>.
                    Warranty and support services are <strong>unavailable</strong> for counterfeit products.
                  </p>
                  {fakeReason && (
                    <div className="p-4 rounded-xl bg-red-900/20 border border-red-700/30 space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-400/80 flex items-center gap-1.5">
                        <AlertTriangle size={12} /> Flagged Reason
                      </p>
                      <p className="text-sm text-red-200/80 italic">&ldquo;{fakeReason}&rdquo;</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Serial Number</p>
                      <p className="font-mono font-bold text-red-300">{inputValue.trim().toUpperCase()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Warranty Status</p>
                      <p className="font-semibold text-red-400 flex items-center gap-1.5">
                        <ShieldAlert size={14} /> Not Applicable — Counterfeit
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-red-900/20 border border-red-700/30 text-sm space-y-2">
                    <p className="font-semibold text-red-300/90 flex items-center gap-1.5">
                      <AlertTriangle size={13} /> What should you do?
                    </p>
                    <p className="text-muted-foreground">
                      If you purchased this product from an authorised dealer, please contact REVOPZ customer care immediately.
                      Do not use this product — counterfeit electronics may pose safety risks.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <Button className="bg-red-700 hover:bg-red-600 text-white flex-1" onClick={handleContactSupport}>
                      <Phone size={16} className="mr-2" /> Contact Support
                    </Button>
                    <Button variant="outline" className="border-border flex-1"
                      onClick={() => { setHasSearched(false); setInputValue(''); setIsFakeProduct(false); setFakeReason(''); }}>
                      <RefreshCw size={16} className="mr-2" /> Search Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* NOT FOUND */}
            {!isFakeProduct && !selectedProduct && (
              <div className="p-12 text-center bg-destructive/10 border border-destructive/20 rounded-3xl space-y-4">
                <AlertCircle size={48} className="text-destructive mx-auto" />
                <h3 className="text-2xl font-bold font-headline">Product Not Found</h3>
                <p className="text-muted-foreground max-w-[400px] mx-auto">
                  We couldn&apos;t find a record for{' '}
                  <span className="font-mono font-bold text-foreground">&quot;{inputValue}&quot;</span>.
                  Please check the serial number on your product label.
                </p>
                <Button variant="outline" onClick={() => { setHasSearched(false); setInputValue(''); }}>
                  <RefreshCw size={16} className="mr-2" /> Try Again
                </Button>
              </div>
            )}

            {/* FOUND */}
            {selectedProduct && (
              <>
                {/* ── Product detail card ─────────────────────────────── */}
                <Card className={`overflow-hidden border-2 transition-all duration-300 ${selectedProduct.warrantyStatus === 'active'
                  ? 'border-green-500/30 bg-green-500/5'
                  : selectedProduct.warrantyStatus === 'expired'
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
                  }`}>
                  <CardHeader className="border-b border-border/50 pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Product Found</p>
                        <CardTitle className="text-2xl font-headline">{selectedProduct.name}</CardTitle>
                      </div>
                      <StatusBadge status={selectedProduct.warrantyStatus} />
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InfoRow icon={<Tag size={18} />} label="Model" value={selectedProduct.model} />
                      <InfoRow icon={<Package size={18} />} label="Category" value={selectedProduct.category} />
                      <InfoRow icon={<ClipboardCheck size={18} />} label="Serial Number" value={selectedProduct.serial} mono />
                      <InfoRow
                        icon={<ShieldCheck size={18} />}
                        label="Warranty Status"
                        value={chipLabel[selectedProduct.warrantyStatus]}
                      />
                      {selectedProduct.warrantyStatus === 'active' && selectedProduct.expiryDate && (
                        <div className="sm:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <InfoRow
                            icon={<ShieldCheck size={18} />}
                            label="Warranty Valid Till"
                            value={formatDate(selectedProduct.expiryDate)}
                            accent="green"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* ── CASE 1: NOT REGISTERED ──────────────────────────── */}
                {selectedProduct.warrantyStatus === 'not_registered' && (
                  <div className="p-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="text-lg font-bold font-headline text-amber-400">⚠ Warranty Not Registered</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Register your product to activate warranty coverage and unlock support services.
                      </p>
                    </div>
                    <Button
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-6 h-auto text-base shrink-0"
                      onClick={() => setIsRegisterOpen(true)}
                    >
                      <ShieldCheck size={18} className="mr-2" /> Register Warranty
                    </Button>
                  </div>
                )}

                {/* ── CASE 2: ACTIVE ──────────────────────────────────── */}
                {selectedProduct.warrantyStatus === 'active' && (
                  <div className="p-6 rounded-2xl border border-green-500/25 bg-green-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold font-headline text-green-400">✅ Active Warranty Coverage</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        {selectedProduct.expiryDate
                          ? <>Your product is under warranty until{' '}<span className="font-semibold text-green-400">{formatDate(selectedProduct.expiryDate)}</span>.</>
                          : 'Your product is covered under active warranty.'}
                      </p>
                    </div>
                    {selectedProduct.registrationId && (
                      <Button 
                        variant="outline" 
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                        onClick={() => setIsSlipOpen(true)}
                      >
                        <FileText size={18} className="mr-2" /> View Warranty Slip
                      </Button>
                    )}
                  </div>
                )}

                {/* ── CASE 3: EXPIRED ─────────────────────────────────── */}
                {selectedProduct.warrantyStatus === 'expired' && (
                  <div className="p-6 rounded-2xl border border-red-500/25 bg-red-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldOff size={20} className="text-red-400" />
                        <h4 className="text-lg font-bold font-headline text-red-400">Warranty Expired</h4>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        This product is no longer covered under warranty.
                      </p>
                    </div>

                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Info grid (shown before search) ───────────────────────────── */}
        {!hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 opacity-80">
            <div className="p-8 rounded-3xl bg-muted/30 border border-border space-y-4">
              <h3 className="text-xl font-bold font-headline">Coverage Details</h3>
              <p className="text-muted-foreground text-sm">
                Inverters are covered for 24 months. Battery packs feature a 60-month warranty
                (36-month full replacement + 24-month pro-rata).
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-muted/30 border border-border space-y-4">
              <h3 className="text-xl font-bold font-headline">Official Support</h3>
              <p className="text-muted-foreground text-sm">
                For immediate assistance without an online claim, call our helpline:{' '}
                <span className="text-primary font-bold">+91 97468 04951</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Register Warranty Modal ─────────────────────────────────────── */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="bg-card max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
              <ShieldCheck className="text-primary" size={24} /> Register Warranty
            </DialogTitle>
            <DialogDescription>
              Fill in your details to activate warranty for{' '}
              <span className="font-semibold text-foreground">{selectedProduct?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="reg-name">
                <User size={14} className="inline mr-1" />Full Name *
              </Label>
              <Input
                id="reg-name"
                placeholder="e.g. Suresh Kumar"
                value={regForm.name}
                onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
              />
              {regErrors.name && <p className="text-xs text-destructive">{regErrors.name}</p>}
            </div>

            {/* Phone + OTP row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="reg-phone">
                  <Phone size={14} className="inline mr-1" />Phone *
                </Label>
                <Input
                  id="reg-phone"
                  placeholder="10-digit number"
                  maxLength={10}
                  value={regForm.phone}
                  onChange={e => setRegForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                />
                {regErrors.phone && <p className="text-xs text-destructive">{regErrors.phone}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-otp">OTP *</Label>
                <div className="flex gap-2">
                  <Input
                    id="reg-otp"
                    placeholder="Enter OTP"
                    maxLength={6}
                    value={regForm.otp}
                    onChange={e => setRegForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))}
                    className="flex-1"
                  />
                </div>
                {regErrors.otp && <p className="text-xs text-destructive">{regErrors.otp}</p>}
                <button
                  type="button"
                  className="text-xs text-primary underline cursor-pointer"
                  onClick={() => toast({ title: 'OTP Sent', description: 'Use any 6-digit code for demo.' })}
                >
                  Send OTP
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="reg-email">
                <Mail size={14} className="inline mr-1" />Email *
              </Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={regForm.email}
                onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
              />
              {regErrors.email && <p className="text-xs text-destructive">{regErrors.email}</p>}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <Label htmlFor="reg-address">
                <MapPin size={14} className="inline mr-1" />Address *
              </Label>
              <Input
                id="reg-address"
                placeholder="Your full address"
                value={regForm.address}
                onChange={e => setRegForm(f => ({ ...f, address: e.target.value }))}
              />
              {regErrors.address && <p className="text-xs text-destructive">{regErrors.address}</p>}
            </div>

            {/* Product Number (auto-filled, disabled) */}
            <div className="space-y-1">
              <Label>
                <ClipboardCheck size={14} className="inline mr-1" />Product Number
              </Label>
              <Input value={selectedProduct?.serial ?? ''} disabled className="bg-muted font-mono" />
            </div>

            {/* Warranty Valid Till (auto-calculated, read-only) */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <CalendarDays size={14} className="inline" />
                Warranty Valid Till
                <Lock size={11} className="ml-0.5 text-muted-foreground opacity-70" />
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={(() => {
                    const d = new Date();
                    d.setFullYear(d.getFullYear() + 5);
                    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  })()}
                  readOnly
                  tabIndex={-1}
                  className="bg-muted/40 text-muted-foreground cursor-not-allowed border-border/40 select-none font-medium"
                />
              </div>
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1 pt-0.5">
                <Lock size={10} />
                Auto-calculated based on standard 5-year warranty. Not editable.
              </p>
            </div>

            <DialogFooter className="pt-4 flex gap-3 sticky bottom-0 bg-card pb-1">
              <Button type="button" variant="ghost" onClick={() => setIsRegisterOpen(false)}>
                <XCircle size={16} className="mr-2" /> Cancel
              </Button>
              <Button type="submit" disabled={isRegistering} className="bg-primary hover:bg-primary/90">
                {isRegistering
                  ? <><Loader2 size={16} className="animate-spin mr-2" /> Registering…</>
                  : <><ShieldCheck size={16} className="mr-2" /> Activate Warranty</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Contact Support Modal ───────────────────────────────────────── */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="bg-card max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
              <Phone className="text-primary" size={22} /> Contact Support
            </DialogTitle>
            <DialogDescription>
              Our support team is ready to assist you.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center gap-4">
            {/* Phone number display */}
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20 w-full justify-center">
              <span className="text-2xl">📞</span>
              <a
                href="tel:+919746804951"
                className="text-2xl font-bold text-primary tracking-wider hover:underline"
              >
                +91 97468 04951
              </a>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Available Mon–Sat, 9 AM – 6 PM IST
            </p>
          </div>

          <DialogFooter className="flex gap-3 sm:flex-row sticky bottom-0 bg-card pt-2 pb-1">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowContactModal(false)}
            >
              <XCircle size={16} className="mr-2" /> Close
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => { window.location.href = 'tel:+919746804951'; }}
            >
              <Phone size={16} className="mr-2" /> Call Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Warranty Slip Modal ────────────────────────────────────────── */}
      <WarrantySlipModal 
        open={isSlipOpen}
        onOpenChange={setIsSlipOpen}
        registrationId={selectedProduct?.registrationId ?? ''}
      />
    </div>
  );
}

// ── Reusable info row ─────────────────────────────────────────────────────────
function InfoRow({
  icon, label, value, mono = false, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  accent?: 'green';
}) {
  const isGreen = accent === 'green';
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${isGreen
        ? 'bg-green-500/8 border-green-500/30'
        : 'bg-background/60 border-border/50'
      }`}>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isGreen ? 'bg-green-500/20 text-green-400' : 'bg-primary/15 text-primary'
        }`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`font-semibold text-base leading-tight ${mono ? 'font-mono' : ''} ${isGreen ? 'text-green-300' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
