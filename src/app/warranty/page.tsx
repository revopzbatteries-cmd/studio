"use client";

import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Loader2, CheckCircle2, AlertCircle, Calendar, Package, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { WarrantyEntry, INITIAL_WARRANTIES, WarrantyStatus } from '@/lib/warranty';

export default function WarrantyPage() {
  const { toast } = useToast();
  const [searchSerial, setSearchSerial] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundWarranty, setFoundWarranty] = useState<WarrantyEntry | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // Sync with LocalStorage
  const getWarranties = (): WarrantyEntry[] => {
    if (typeof window === 'undefined') return INITIAL_WARRANTIES;
    const saved = localStorage.getItem('revopz_warranties');
    return saved ? JSON.parse(saved) : INITIAL_WARRANTIES;
  };

  const saveWarranties = (data: WarrantyEntry[]) => {
    localStorage.setItem('revopz_warranties', JSON.stringify(data));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSerial.trim()) return;

    setIsSearching(true);
    setHasSearched(false);
    
    // Simulate API delay
    setTimeout(() => {
      const warranties = getWarranties();
      const match = warranties.find(w => w.serialNumber.toLowerCase() === searchSerial.trim().toLowerCase());
      setFoundWarranty(match || null);
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
  };

  const handleClaimSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!foundWarranty) return;

    setIsSubmittingClaim(true);
    const formData = new FormData(e.currentTarget);
    
    const message = formData.get('issue') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    setTimeout(() => {
      const warranties = getWarranties();
      const updated = warranties.map(w => 
        w.id === foundWarranty.id 
          ? { ...w, status: 'Claim Requested' as WarrantyStatus, claimMessage: message, customerName: name, email, phone } 
          : w
      );
      
      saveWarranties(updated);
      setFoundWarranty(updated.find(w => w.id === foundWarranty.id) || null);
      setIsSubmittingClaim(false);
      setIsClaimModalOpen(false);
      
      toast({
        title: "Claim Submitted",
        description: "Your warranty claim has been received. Our team will contact you soon.",
      });
    }, 1500);
  };

  const getStatusBadge = (status: WarrantyStatus) => {
    switch (status) {
      case 'Active': return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case 'Expired': return <Badge variant="secondary">Expired</Badge>;
      case 'Claim Requested': return <Badge className="bg-orange-500 hover:bg-orange-600">Claim Requested</Badge>;
      case 'Claim Approved': return <Badge className="bg-blue-600 hover:bg-blue-700">Claim Approved</Badge>;
      case 'Claim Rejected': return <Badge variant="destructive">Claim Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-[900px]">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Warranty & Support</h1>
          <p className="text-muted-foreground text-lg">Check your product status and submit claims online.</p>
        </div>

        {/* Search Section */}
        <Card className="bg-card border-primary/20 shadow-xl mb-12 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              <Search className="text-primary" size={24} /> Check Your Warranty
            </CardTitle>
            <CardDescription>Enter the unique serial number found on your REVOPZ unit.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="e.g. RV-1K-001" 
                  value={searchSerial}
                  onChange={(e) => setSearchSerial(e.target.value)}
                  className="h-12 bg-muted/50 text-lg uppercase font-mono"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90" disabled={isSearching}>
                {isSearching ? <Loader2 className="animate-spin mr-2" /> : <Search size={18} className="mr-2" />}
                {isSearching ? 'Checking...' : 'Check Status'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {foundWarranty ? (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Product</p>
                          <h3 className="text-xl font-bold">{foundWarranty.productName}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Expiry Date</p>
                          <h3 className="text-xl font-bold">{foundWarranty.expiryDate}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(foundWarranty.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                          <User size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Registered To</p>
                          <h3 className="text-xl font-bold">{foundWarranty.customerName}</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {foundWarranty.status === 'Active' && (
                    <div className="mt-10 p-6 rounded-2xl bg-background border border-border flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h4 className="text-lg font-bold font-headline">Need Technical Support?</h4>
                        <p className="text-muted-foreground">If you're experiencing issues, you can file a claim.</p>
                      </div>
                      <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-accent hover:bg-accent/90 px-8 py-6 h-auto text-lg">
                            Claim Warranty
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-headline">Submit Warranty Claim</DialogTitle>
                            <DialogDescription>
                              Please describe the issue you are facing with your {foundWarranty.productName}.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleClaimSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input name="name" defaultValue={foundWarranty.customerName} required />
                              </div>
                              <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input name="phone" defaultValue={foundWarranty.phone} required />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input name="email" type="email" defaultValue={foundWarranty.email} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Serial Number</Label>
                              <Input value={foundWarranty.serialNumber} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                              <Label>Describe the Issue</Label>
                              <Textarea name="issue" placeholder="Describe what's wrong with the unit..." required className="min-h-[120px]" />
                            </div>
                            <DialogFooter className="pt-4">
                              <Button type="button" variant="ghost" onClick={() => setIsClaimModalOpen(false)}>Cancel</Button>
                              <Button type="submit" disabled={isSubmittingClaim}>
                                {isSubmittingClaim ? <Loader2 className="animate-spin mr-2" /> : null}
                                Submit Claim
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="p-12 text-center bg-destructive/10 border border-destructive/20 rounded-3xl space-y-4">
                <AlertCircle size={48} className="text-destructive mx-auto" />
                <h3 className="text-2xl font-bold font-headline">Serial Number Not Found</h3>
                <p className="text-muted-foreground max-w-[400px] mx-auto">
                  We couldn't find a record for <span className="font-mono font-bold text-foreground">"{searchSerial}"</span>. 
                  Please double-check the code on your product label.
                </p>
                <Button variant="outline" onClick={() => setHasSearched(false)}>Try Again</Button>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 opacity-80">
            <div className="p-8 rounded-3xl bg-muted/30 border border-border space-y-4">
              <h3 className="text-xl font-bold font-headline">Coverage Details</h3>
              <p className="text-muted-foreground text-sm">
                Inverters are covered for 24 months. Battery packs feature a 60-month warranty (36-month full replacement + 24-month pro-rata).
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-muted/30 border border-border space-y-4">
              <h3 className="text-xl font-bold font-headline">Official Support</h3>
              <p className="text-muted-foreground text-sm">
                For immediate assistance without an online claim, call our helpline: <span className="text-primary font-bold">+91 97468 04951</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
