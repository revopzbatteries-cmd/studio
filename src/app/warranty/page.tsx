"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { RecaptchaVerifier, ConfirmationResult, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

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

  // OTP state
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [shakePhone, setShakePhone] = useState(false);
  const [isCaptchaModalOpen, setIsCaptchaModalOpen] = useState(false);

  // Resend OTP timer effect
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (resendTimer > 0) {
      timerId = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timerId);
  }, [resendTimer]);

  // Note: reCAPTCHA ref and verifier logic have been moved below handleSendOTPAfterCaptcha to avoid Temporal Dead Zone errors.

  // complaint
  const [isComplaintLoading, setIsComplaintLoading] = useState(false);

  // contact support modal
  const [showContactModal, setShowContactModal] = useState(false);

  // warranty slip modal
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  // ── Body scroll lock when any modal is open ──────────────────────────
  useEffect(() => {
    const anyOpen = isRegisterOpen || showContactModal || isCaptchaModalOpen;
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isRegisterOpen, showContactModal, isCaptchaModalOpen]);

  // ── Reset states and clean up on modal close ───────────────────────────────
  useEffect(() => {
    if (!isRegisterOpen) {
      setRegForm({ name: '', phone: '', otp: '', email: '', address: '' });
      setRegErrors(prev => ({ ...prev, phone: '', otp: '' }));
      setPhoneVerified(false);
      setOtpSent(false);
      setResendTimer(0);
      setIsCaptchaModalOpen(false);
      if (window.confirmationResult) {
        window.confirmationResult = undefined;
      }
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // ignore
        }
        window.recaptchaVerifier = undefined;
      }
    }
  }, [isRegisterOpen]);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setRegForm(f => ({ ...f, phone: value }));
    if (regErrors.phone) {
      setRegErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setRegForm(f => ({ ...f, otp: value }));
    if (regErrors.otp) {
      setRegErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleSendOTP = async () => {
    const phoneTrimmed = regForm.phone.trim();

    // 1. EMPTY PHONE VALIDATION
    if (!phoneTrimmed) {
      setRegErrors(prev => ({ ...prev, phone: 'Please enter your phone number' }));
      setShakePhone(true);
      setTimeout(() => setShakePhone(false), 500);
      toast({
        title: 'Error',
        description: 'Please enter your phone number',
        variant: 'destructive',
      });
      return;
    }

    // 2. VALID INDIAN NUMBER CHECK
    const isValidIndian = /^[6-9]\d{9}$/.test(phoneTrimmed);
    if (!isValidIndian) {
      setRegErrors(prev => ({ ...prev, phone: 'Enter a valid mobile number' }));
      setShakePhone(true);
      setTimeout(() => setShakePhone(false), 500);
      toast({
        title: 'Error',
        description: 'Enter a valid mobile number',
        variant: 'destructive',
      });
      return;
    }

    setRegErrors(prev => ({ ...prev, phone: '' }));
    
    // Reset OTP UI states before verifying
    setOtpSent(false);
    
    // Open the Captcha Modal
    setIsCaptchaModalOpen(true);
  };

  const handleSendOTPAfterCaptcha = async () => {
    const phoneTrimmed = regForm.phone.trim();
    setIsSendingOtp(true);
    
    console.log('[Firebase Auth] OTP request started for phone:', phoneTrimmed);

    try {
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA verifier not initialized.');
      }

      // 4. AUTO FORMAT NUMBER
      const formattedPhone = `+91${phoneTrimmed}`;
      console.log('[Firebase Auth] signInWithPhoneNumber started for formatted phone:', formattedPhone);

      // 5. Firebase call
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmation;
      console.log('[Firebase Auth] signInWithPhoneNumber success. Confirmation result saved.');

      // 6. Successful OTP send actions
      setOtpSent(true);
      setResendTimer(30);
      toast({
        title: '✅ OTP Sent',
        description: 'Verification code sent successfully to your phone.',
      });

      // 7. THEN close the captcha modal once successfully sent!
      setIsCaptchaModalOpen(false);
    } catch (error: any) {
      console.error('[Firebase Auth] error object caught:', error);
      console.error('[Firebase Auth] error code:', error?.code, 'message:', error?.message);
      setOtpSent(false);

      // Close the modal on failure so user can try again
      setIsCaptchaModalOpen(false);

      let errMsg = 'Failed to send verification code. Please try again.';
      if (error?.code === 'auth/operation-not-allowed') {
        errMsg = 'Phone Authentication is not enabled in the Firebase Console. Please go to Firebase Console -> Authentication -> Sign-in method, enable "Phone", and save.';
      } else if (error?.code === 'auth/invalid-phone-number') {
        errMsg = 'The phone number format is invalid.';
      } else if (error?.code === 'auth/too-many-requests') {
        errMsg = 'Too many requests. Please try again later.';
      } else if (error?.code === 'auth/network-request-failed') {
        errMsg = 'Network error. Please check your internet connection.';
      } else if (error?.code === 'auth/captcha-check-failed') {
        errMsg = 'reCAPTCHA verification failed. Please try again.';
      } else if (error?.code === 'auth/internal-error') {
        errMsg = 'Internal Firebase authentication error. Please ensure localhost is an authorized domain and retry.';
      }

      toast({
        title: 'Error',
        description: errMsg,
        variant: 'destructive',
      });

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // ignore
        }
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Keep handleSendOTPAfterCaptcha in a ref to avoid stale closures in reCAPTCHA callback
  const handleSendOtpRef = useRef(handleSendOTPAfterCaptcha);
  useEffect(() => {
    handleSendOtpRef.current = handleSendOTPAfterCaptcha;
  }, [handleSendOTPAfterCaptcha]);

  // ── reCAPTCHA Callback Ref for deterministic initialization and cleanup ──
  const recaptchaContainerRef = useCallback((element: HTMLDivElement | null) => {
    if (!element) {
      // Element is unmounting — clean up the verifier instance
      if (window.recaptchaVerifier) {
        console.log('[Firebase Auth] Unmounting: Clearing recaptchaVerifier.');
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('[Firebase Auth] Error clearing verifier on unmount:', e);
        }
        window.recaptchaVerifier = undefined;
      }
      return;
    }

    console.log('[Firebase Auth] Recaptcha element mounted. Initializing verifier...');

    // Clear any existing stale verifier
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('[Firebase Auth] Error clearing stale verifier:', e);
      }
      window.recaptchaVerifier = undefined;
    }

    try {
      // Pass the HTML element reference directly to prevent DOM ID selection races
      window.recaptchaVerifier = new RecaptchaVerifier(auth, element, {
        size: 'normal',
        callback: async () => {
          console.log('[Firebase Auth] reCAPTCHA successfully solved.');
          await handleSendOtpRef.current();
        },
        'expired-callback': () => {
          console.warn('[Firebase Auth] reCAPTCHA token expired.');
          toast({
            title: 'Verification Expired',
            description: 'Captcha verification has expired. Please verify again.',
            variant: 'destructive',
          });
        }
      });

      window.recaptchaVerifier.render().then((widgetId) => {
        console.log('[Firebase Auth] reCAPTCHA widget rendered successfully. Widget ID:', widgetId);
      });
    } catch (err: any) {
      console.error('[Firebase Auth] Failed to initialize RecaptchaVerifier:', err);
      toast({
        title: 'Verification Error',
        description: 'Failed to initialize security captcha. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleVerifyOTP = async () => {
    if (!regForm.otp || regForm.otp.length < 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter a 6-digit OTP.', variant: 'destructive' });
      return;
    }
    
    if (!window.confirmationResult) {
      toast({ title: 'Error', description: 'Please request an OTP first.', variant: 'destructive' });
      return;
    }

    setIsVerifying(true);
    try {
      await window.confirmationResult.confirm(regForm.otp);
      setPhoneVerified(true);
      toast({
        title: '✅ Verification Successful',
        description: 'Your phone number has been securely verified.',
      });
      setRegErrors(prev => ({ ...prev, otp: '', phone: '' }));
    } catch (error: any) {
      let errMsg = 'Failed to verify OTP. Please try again.';
      if (error.code === 'auth/invalid-verification-code') {
        errMsg = 'The 6-digit code is incorrect. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errMsg = 'This OTP has expired. Please request a new one.';
      } else if (error.code === 'auth/too-many-requests') {
        errMsg = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errMsg = 'The phone number format is invalid.';
      } else if (error.code === 'auth/network-request-failed') {
        errMsg = 'Network error. Please check your internet connection.';
      }
      toast({
        title: 'Verification Failed',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReg() || !selectedProduct) return;

    if (!phoneVerified) {
      toast({
        title: 'Verification Required',
        description: 'Please verify your phone number',
        variant: 'destructive'
      });
      return;
    }

    if (isRegistering) return;
    setIsRegistering(true);
    try {
      const formattedPhone = regForm.phone.startsWith('+') ? regForm.phone : `+91${regForm.phone.replace(/^0+/, '')}`;

      const payload = {
        customerName: regForm.name,
        customerPhone: formattedPhone,
        customerEmail: regForm.email,
        address: regForm.address,
        serialNumber: selectedProduct.serial,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        model: selectedProduct.model,
        phoneVerified: phoneVerified,
        verifiedPhoneNumber: formattedPhone,
      };

      const res = await fetch('/api/warranty/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to register warranty');

      await triggerSearch(selectedProduct.serial);
      
      router.refresh();

      setIsRegisterOpen(false);
      setRegForm({ name: '', phone: '', otp: '', email: '', address: '' });
      setRegErrors({});
      setPhoneVerified(false);
      setOtpSent(false);
      setResendTimer(0);
      window.confirmationResult = undefined;
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = undefined;
      }

      toast({
        title: '🎉 Warranty Registered!',
        description: `${selectedProduct.name} is now covered under active warranty.`,
      });

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
        <DialogContent className="max-md:bottom-auto max-md:top-1/2 max-md:-translate-y-1/2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:w-[calc(100vw-32px)] max-md:rounded-2xl max-md:p-6 max-w-[520px] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-card border-primary/20 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
              <ShieldCheck className="text-primary" size={24} /> Register Warranty
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80 mt-1.5">
              Fill in your details to activate warranty for{' '}
              <span className="font-semibold text-foreground">{selectedProduct?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-name" className="text-sm font-medium flex items-center">
                <User size={14} className="inline mr-1.5 text-muted-foreground" />Full Name *
              </Label>
              <Input
                id="reg-name"
                placeholder="e.g. Suresh Kumar"
                value={regForm.name}
                onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                className="bg-background border-border/80 focus-visible:ring-primary focus-visible:ring-1 h-11"
              />
              {regErrors.name && <p className="text-xs text-destructive mt-1 font-medium">{regErrors.name}</p>}
            </div>

            {/* Phone + OTP row */}
            <div className={`grid grid-cols-1 ${otpSent ? 'sm:grid-cols-2' : ''} gap-5 transition-all duration-300`}>
              <div className="space-y-1.5">
                <Label htmlFor="reg-phone" className="text-sm font-medium flex items-center">
                  <Phone size={14} className="inline mr-1.5 text-muted-foreground" />Phone *
                </Label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                  <Input
                    id="reg-phone"
                    placeholder="10-digit number"
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel"
                    value={regForm.phone}
                    onChange={handlePhoneChange}
                    disabled={phoneVerified || isSendingOtp}
                    className={`transition-all duration-300 h-11 w-full ${
                      phoneVerified
                        ? 'bg-green-500/10 border-green-500/30 text-green-500 font-semibold'
                        : regErrors.phone
                        ? 'border-red-500 focus-visible:ring-red-500 bg-red-500/5'
                        : ''
                    } ${shakePhone ? 'animate-shake' : ''}`}
                  />
                  {!otpSent && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto h-11 shrink-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-border/80 hover:bg-accent/10"
                      onClick={handleSendOTP}
                      disabled={!regForm.phone.trim() || !/^[6-9]\d{9}$/.test(regForm.phone.trim()) || isSendingOtp || isCaptchaModalOpen}
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-1.5" />
                          Sending OTP...
                        </>
                      ) : isCaptchaModalOpen ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-1.5" />
                          Verifying...
                        </>
                      ) : (
                        'Send OTP'
                      )}
                    </Button>
                  )}
                </div>
                {regErrors.phone && (
                  <p className="text-xs text-red-500 font-medium mt-1 animate-in fade-in duration-200">
                    {regErrors.phone}
                  </p>
                )}
              </div>

              {otpSent && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                  <Label htmlFor="reg-otp" className="text-sm font-medium">OTP *</Label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                    <Input
                      id="reg-otp"
                      placeholder="• • • • • •"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={regForm.otp}
                      onChange={handleOtpChange}
                      className={`flex-1 h-11 text-center font-mono tracking-[0.3em] transition-all duration-300 ${
                        phoneVerified
                          ? 'bg-green-500/10 border-green-500/30 text-green-500 font-bold'
                          : regErrors.otp
                          ? 'border-red-500 focus-visible:ring-red-500 bg-red-500/5'
                          : ''
                      }`}
                      disabled={phoneVerified || isVerifying}
                    />
                    <Button 
                      type="button" 
                      variant={phoneVerified ? "default" : "outline"}
                      className={`w-full sm:w-auto h-11 px-5 transition-all duration-300 shadow-sm ${
                        phoneVerified
                          ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 disabled:opacity-100'
                          : 'border-border/80'
                      }`}
                      onClick={handleVerifyOTP}
                      disabled={isVerifying || phoneVerified || regForm.otp.length < 6}
                    >
                      {isVerifying ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : phoneVerified ? (
                        <>
                          <CheckCircle2 size={16} className="mr-1.5" /> Verified
                        </>
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                  {regErrors.otp && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {regErrors.otp}
                    </p>
                  )}
                  {!phoneVerified && (
                    <div className="min-h-[24px] flex items-center mt-1">
                      <button
                        type="button"
                        className="text-xs text-primary underline cursor-pointer disabled:opacity-50 disabled:no-underline disabled:cursor-default transition-opacity hover:text-primary/80"
                        onClick={handleSendOTP}
                        disabled={isSendingOtp || resendTimer > 0}
                      >
                        {resendTimer > 0
                          ? `Resend OTP in ${resendTimer}s`
                          : 'Resend OTP'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-sm font-medium flex items-center">
                <Mail size={14} className="inline mr-1.5 text-muted-foreground" />Email *
              </Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={regForm.email}
                onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                className="bg-background border-border/80 focus-visible:ring-primary focus-visible:ring-1 h-11"
              />
              {regErrors.email && <p className="text-xs text-destructive mt-1 font-medium">{regErrors.email}</p>}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-address" className="text-sm font-medium flex items-center">
                <MapPin size={14} className="inline mr-1.5 text-muted-foreground" />Address *
              </Label>
              <Input
                id="reg-address"
                placeholder="Your full address"
                value={regForm.address}
                onChange={e => setRegForm(f => ({ ...f, address: e.target.value }))}
                className="bg-background border-border/80 focus-visible:ring-primary focus-visible:ring-1 h-11"
              />
              {regErrors.address && <p className="text-xs text-destructive mt-1 font-medium">{regErrors.address}</p>}
            </div>

            {/* Product Number (auto-filled, disabled) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center">
                <ClipboardCheck size={14} className="inline mr-1.5 text-muted-foreground" />Product Number
              </Label>
              <Input value={selectedProduct?.serial ?? ''} disabled className="bg-muted/40 font-mono h-11 cursor-not-allowed border-border/40" />
            </div>

            {/* Warranty Valid Till (auto-calculated, read-only) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <CalendarDays size={14} className="inline text-muted-foreground" />
                Warranty Valid Till
                <Lock size={11} className="text-muted-foreground opacity-70" />
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
                  className="bg-muted/40 text-muted-foreground cursor-not-allowed border-border/40 select-none font-medium h-11"
                />
              </div>
              <p className="text-xs text-muted-foreground/75 flex items-center gap-1.5 pt-0.5">
                <Lock size={10} />
                Auto-calculated based on standard 5-year warranty. Not editable.
              </p>
            </div>

            <DialogFooter className="pt-5 flex gap-3 sticky bottom-0 bg-card pb-1 mt-4 sm:mt-6 border-t border-border/30">
              <Button type="button" variant="ghost" onClick={() => setIsRegisterOpen(false)} className="h-11 hover:bg-accent/10 border-border/60">
                <XCircle size={16} className="mr-2" /> Cancel
              </Button>
              <Button type="submit" disabled={isRegistering || !phoneVerified} className="h-11 bg-primary hover:bg-primary/90 text-white font-medium px-6">
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

      {/* ── Captcha Verification Modal ─────────────────────────────────── */}
      <Dialog open={isCaptchaModalOpen} onOpenChange={setIsCaptchaModalOpen}>
        <DialogContent className="max-md:bottom-auto max-md:top-1/2 max-md:-translate-y-1/2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:w-[calc(100vw-32px)] max-md:rounded-2xl max-md:p-6 max-w-[380px] bg-black/85 backdrop-blur-xl border border-white/10 shadow-2xl text-center flex flex-col items-center justify-center p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader className="flex flex-col items-center text-center space-y-1.5 w-full">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary mb-2">
              <ShieldAlert className="animate-pulse" size={24} />
            </div>
            <DialogTitle className="text-xl font-headline font-semibold text-white">
              Security Verification
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs leading-normal">
              Please confirm you are not a robot
            </DialogDescription>
          </DialogHeader>

          {/* reCAPTCHA Widget Center Container */}
          <div className="w-full flex justify-center py-5 select-none min-h-[78px]">
            <div 
              ref={recaptchaContainerRef}
              id="recaptcha-container" 
              className="mx-auto overflow-hidden rounded-md border border-white/5 shadow-inner"
            ></div>
          </div>

          <p className="text-[10px] text-muted-foreground/60 leading-normal max-w-[280px]">
            This verification is protected by Firebase reCAPTCHA and complies with our privacy policy and security protocols.
          </p>
        </DialogContent>
      </Dialog>
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
