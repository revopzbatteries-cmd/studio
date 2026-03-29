"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Phone, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export function EnquiryModal({ isOpen, onClose, productName }: EnquiryModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'options' | 'email'>('options');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWhatsApp = () => {
    const message = productName 
      ? `Hello, I would like to enquire about ${productName}.`
      : `Hello, I would like to enquire about REVOPZ products.`;
    window.open(`https://wa.me/919746804951?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePhone = () => {
    window.location.href = 'tel:+919746804951';
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Enquiry Sent",
        description: "Thank you for reaching out. We will contact you shortly.",
      });
      onClose();
      setStep('options');
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">
            {step === 'options' ? 'How would you like to enquire?' : 'Email Enquiry'}
          </DialogTitle>
          <DialogDescription>
            {productName ? `Inquiry for: ${productName}` : 'Our team is ready to help you.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'options' ? (
          <div className="grid gap-4 py-4">
            <Button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#25D366]/90 flex items-center justify-center gap-2 h-12">
              <MessageCircle size={20} />
              Continue to WhatsApp
            </Button>
            <Button onClick={handlePhone} className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 h-12">
              <Phone size={20} />
              Call Directly
            </Button>
            <Button onClick={() => setStep('email')} variant="outline" className="w-full flex items-center justify-center gap-2 h-12 border-muted-foreground/30">
              <Mail size={20} />
              Send Email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="John Doe" required className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" required className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+91 00000 00000" required className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="I'm interested in..." required className="bg-muted/50 min-h-[100px]" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setStep('options')}>
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Send Enquiry'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}