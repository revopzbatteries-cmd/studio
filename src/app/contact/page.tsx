"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, MapPin, MessageCircle, Loader2, ExternalLink, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmittingGeneral, setIsSubmittingGeneral] = useState(false);
  const [isSubmittingDealer, setIsSubmittingDealer] = useState(false);

  // General Enquiry controlled fields
  const [generalName, setGeneralName] = useState('');
  const [generalPhone, setGeneralPhone] = useState('');
  const [generalEmail, setGeneralEmail] = useState('');
  const [generalMessage, setGeneralMessage] = useState('');

  // Dealer form controlled fields
  const [dealerBusinessName, setDealerBusinessName] = useState('');
  const [dealerContactPerson, setDealerContactPerson] = useState('');
  const [dealerEmail, setDealerEmail] = useState('');
  const [dealerPhone, setDealerPhone] = useState('');
  const [dealerLocation, setDealerLocation] = useState('');
  const [dealerBizDetails, setDealerBizDetails] = useState('');

  // Validation errors
  const [generalPhoneError, setGeneralPhoneError] = useState(false);
  const [dealerPhoneError, setDealerPhoneError] = useState(false);

  const validatePhone = (phone: string) => {
    // Strip spaces for validation
    const cleanPhone = phone.replace(/\s/g, '');
    // Regex for: optional +91 followed by exactly 10 digits
    const phoneRegex = /^(\+91)?\d{10}$/;
    return phoneRegex.test(cleanPhone);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d+]/g, '');
    if (numbers.startsWith('+91')) {
      const main = numbers.slice(3, 13);
      if (main.length > 5) {
        return `+91 ${main.slice(0, 5)} ${main.slice(5, 10)}`;
      }
      return numbers;
    }
    const main = numbers.slice(0, 10);
    if (main.length > 5) {
      return `${main.slice(0, 5)} ${main.slice(5, 10)}`;
    }
    return main;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'general' | 'dealer') => {
    const formatted = formatPhone(e.target.value);
    const isValid = validatePhone(formatted);

    if (type === 'general') {
      setGeneralPhone(formatted);
      setGeneralPhoneError(!isValid && formatted.length > 0);
    } else {
      setDealerPhone(formatted);
      setDealerPhoneError(!isValid && formatted.length > 0);
    }
  };

  // ── Google Form configuration ───────────────────────────────────────────────
  const GENERAL_FORM_ACTION =
    'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdyW23wOwz3xGz0Vgf-NqM-T3x7nFdaXkLJonaqMWoqhBL8Zg/formResponse';

  const DEALER_FORM_ACTION =
    'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeS5ZWtJJFJtslEmjgyXzt8zFZMwHNkMn2Kxgtm6rnBKM4H0A/formResponse';

  const submitToGoogleForm = async (action: string, data: Record<string, string>): Promise<void> => {
    const body = new URLSearchParams(data);
    // no-cors is required — Google Forms does not send CORS headers.
    // The response will be opaque (we cannot read it), but the submission
    // lands in the spreadsheet as long as the payload is well-formed.
    await fetch(action, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  };
  // ────────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent, type: 'general' | 'dealer') => {
    e.preventDefault();

    const phoneToValidate = type === 'general' ? generalPhone : dealerPhone;
    if (!validatePhone(phoneToValidate)) {
      if (type === 'general') setGeneralPhoneError(true);
      else setDealerPhoneError(true);

      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number.',
      });
      return;
    }

    if (type === 'general') {
      setIsSubmittingGeneral(true);
      try {
        await submitToGoogleForm(GENERAL_FORM_ACTION, {
          'entry.1898505011': generalName,
          'entry.1108166281': generalPhone,
          'entry.1773144585': generalEmail,
          'entry.264775934': generalMessage,
        });
        toast({
          title: 'Message Sent!',
          description: 'Our representative will get in touch with you shortly.',
        });
        setGeneralName('');
        setGeneralPhone('');
        setGeneralEmail('');
        setGeneralMessage('');
      } catch {
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: 'Something went wrong. Please try again or contact us directly.',
        });
      } finally {
        setIsSubmittingGeneral(false);
      }
    } else {
      setIsSubmittingDealer(true);
      try {
        await submitToGoogleForm(DEALER_FORM_ACTION, {
          'entry.742173392':  dealerBusinessName,
          'entry.2083567702': dealerContactPerson,
          'entry.909203719':  dealerEmail,
          'entry.1600660088': dealerPhone,
          'entry.566495979':  dealerLocation,
          'entry.1059360787': dealerBizDetails,
        });
        toast({
          title: 'Application Received!',
          description: 'Our team will review your dealership application and contact you soon.',
        });
        setDealerBusinessName('');
        setDealerContactPerson('');
        setDealerEmail('');
        setDealerPhone('');
        setDealerLocation('');
        setDealerBizDetails('');
      } catch {
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: 'Something went wrong. Please try again or contact us directly.',
        });
      } finally {
        setIsSubmittingDealer(false);
      }
    }
  };

  const googleMapsUrl = "https://www.google.com/maps?q=10.781742,76.070464";
  const instagramUrl = "https://www.instagram.com/revopz._/";

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold font-headline">Get in Touch</h1>
              <p className="text-muted-foreground">Have questions about our products or partnership opportunities? We're here to help.</p>
            </div>

            <div className="space-y-6">
              <ContactItem
                icon={<Phone className="text-primary" />}
                title="Phone"
                value="+91 97468 04951"
                href="tel:+919746804951"
              />
              <ContactItem
                icon={<MessageCircle className="text-primary" />}
                title="WhatsApp"
                value="+91 97468 04951"
                href="https://wa.me/919746804951"
              />
              <ContactItem
                icon={<Linkedin className="text-primary" />}
                title="LinkedIn"
                value="Follow us on LinkedIn"
                href="#"
                onClick={(e) => e.preventDefault()}
              />
              <ContactItem
                icon={<Twitter className="text-primary" />}
                title="X (Twitter)"
                value="Follow us on X"
                href="#"
                onClick={(e) => e.preventDefault()}
              />
              <ContactItem
                icon={<Facebook className="text-primary" />}
                title="Facebook"
                value="Follow us on Facebook"
                href="#"
                onClick={(e) => e.preventDefault()}
              />
              <ContactItem
                icon={<Instagram className="text-primary" />}
                title="Instagram"
                value="@revopz._"
                href={instagramUrl}
              />
              <ContactItem
                icon={<Mail className="text-primary" />}
                title="Email"
                value="info@revopz.com"
                href="mailto:info@revopz.com"
              />
              <ContactItem
                icon={<MapPin className="text-primary" />}
                title="Location"
                value="Koottanad Road, Padinjarangadi, Near HP Petrol Pump, Pattambi, Palakkad, Kerala, India"
                href={googleMapsUrl}
              />
            </div>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2 bg-card rounded-3xl p-8 md:p-12 border">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-muted/50 h-auto p-1">
                <TabsTrigger value="general" className="py-4 text-base font-medium">General Enquiry</TabsTrigger>
                <TabsTrigger value="dealer" className="py-4 text-base font-medium">Dealership Form</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <form onSubmit={(e) => handleSubmit(e, 'general')} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="general-name">Full Name</Label>
                      <Input
                        id="general-name"
                        placeholder="John Doe"
                        required
                        value={generalName}
                        onChange={(e) => setGeneralName(e.target.value)}
                        className="h-12 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="general-phone" className={cn(generalPhoneError && 'text-destructive')}>
                        Phone Number
                      </Label>
                      <Input
                        id="general-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                        value={generalPhone}
                        onChange={(e) => handlePhoneChange(e, 'general')}
                        className={cn(
                          'h-12 bg-muted/30 transition-colors',
                          generalPhoneError && 'border-destructive focus-visible:ring-destructive'
                        )}
                      />
                      {generalPhoneError && (
                        <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                          Please enter a valid 10-digit phone number
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="general-email">Email Address</Label>
                    <Input
                      id="general-email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={generalEmail}
                      onChange={(e) => setGeneralEmail(e.target.value)}
                      className="h-12 bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="general-message">Your Message</Label>
                    <Textarea
                      id="general-message"
                      placeholder="How can we help you today?"
                      required
                      value={generalMessage}
                      onChange={(e) => setGeneralMessage(e.target.value)}
                      className="min-h-[150px] bg-muted/30"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 py-6"
                    disabled={isSubmittingGeneral}
                  >
                    {isSubmittingGeneral ? <Loader2 className="animate-spin" /> : 'Send Message'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="dealer">
                <form onSubmit={(e) => handleSubmit(e, 'dealer')} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dealer-business-name">Business Name</Label>
                      <Input
                        id="dealer-business-name"
                        placeholder="Revopz Dealer Store"
                        required
                        value={dealerBusinessName}
                        onChange={(e) => setDealerBusinessName(e.target.value)}
                        className="h-12 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dealer-contact-person">Contact Person</Label>
                      <Input
                        id="dealer-contact-person"
                        placeholder="Jane Doe"
                        required
                        value={dealerContactPerson}
                        onChange={(e) => setDealerContactPerson(e.target.value)}
                        className="h-12 bg-muted/30"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dealer-email">Email Address</Label>
                      <Input
                        id="dealer-email"
                        type="email"
                        placeholder="jane@example.com"
                        required
                        value={dealerEmail}
                        onChange={(e) => setDealerEmail(e.target.value)}
                        className="h-12 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dealer-phone" className={cn(dealerPhoneError && 'text-destructive')}>
                        Phone Number
                      </Label>
                      <Input
                        id="dealer-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                        value={dealerPhone}
                        onChange={(e) => handlePhoneChange(e, 'dealer')}
                        className={cn(
                          'h-12 bg-muted/30 transition-colors',
                          dealerPhoneError && 'border-destructive focus-visible:ring-destructive'
                        )}
                      />
                      {dealerPhoneError && (
                        <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                          Please enter a valid 10-digit phone number
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealer-location">Location / City</Label>
                    <Input
                      id="dealer-location"
                      placeholder="Cochin, Kerala"
                      required
                      value={dealerLocation}
                      onChange={(e) => setDealerLocation(e.target.value)}
                      className="h-12 bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealer-biz-details">Current Business Details</Label>
                    <Textarea
                      id="dealer-biz-details"
                      placeholder="Tell us about your current business and reach..."
                      required
                      value={dealerBizDetails}
                      onChange={(e) => setDealerBizDetails(e.target.value)}
                      className="min-h-[120px] bg-muted/30"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 py-6"
                    disabled={isSubmittingDealer}
                  >
                    {isSubmittingDealer ? <Loader2 className="animate-spin" /> : 'Apply for Dealership'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Location Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold font-headline">Our Location</h2>
              <div className="flex items-start gap-2 text-muted-foreground text-lg max-w-[600px]">
                <MapPin className="shrink-0 mt-1 text-primary" size={24} />
                <p>Koottanad Road, Padinjarangadi, Near HP Petrol Pump, Pattambi, Palakkad, Kerala, India</p>
              </div>
            </div>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 border-primary text-primary hover:bg-primary/10">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Open in Google Maps <ExternalLink size={18} />
              </a>
            </Button>
          </div>

          <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-border shadow-2xl relative bg-muted/20">
            <iframe
              src="https://maps.google.com/maps?q=10.781742,76.070464&z=15&output=embed"
              className="absolute inset-0 w-full h-full grayscale contrast-125 opacity-90"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.85) contrast(1.1)' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ContactItem({ icon, title, value, href, onClick }: { icon: React.ReactNode, title: string, value: string, href: string, onClick?: (e: React.MouseEvent) => void }) {
  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      className="flex items-start gap-4 group"
      title={isExternal ? `Visit our ${title}` : `Contact us via ${title}`}
    >
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-muted-foreground group-hover:text-primary transition-colors">{value}</p>
      </div>
    </a>
  );
}
