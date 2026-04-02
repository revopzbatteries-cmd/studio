"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/tabs';
import { Phone, Mail, MapPin, MessageCircle, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Request Received",
        description: "Our representative will get in touch with you shortly.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  const googleMapsUrl = "https://www.google.com/maps?q=10.781742,76.070464";

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

            <div className="space-y-8">
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input placeholder="John Doe" required className="h-12 bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input type="tel" placeholder="+91 00000 00000" required className="h-12 bg-muted/30" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="john@example.com" required className="h-12 bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Your Message</Label>
                    <Textarea placeholder="How can we help you today?" required className="min-h-[150px] bg-muted/30" />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 py-6" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Send Message'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="dealer">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input placeholder="Revopz Dealer Store" required className="h-12 bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input placeholder="Jane Doe" required className="h-12 bg-muted/30" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input type="email" placeholder="jane@example.com" required className="h-12 bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input type="tel" placeholder="+91 00000 00000" required className="h-12 bg-muted/30" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location / City</Label>
                    <Input placeholder="Cochin, Kerala" required className="h-12 bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Business Details</Label>
                    <Textarea placeholder="Tell us about your current business and reach..." required className="min-h-[120px] bg-muted/30" />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 py-6" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Apply for Dealership'}
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

          <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-border shadow-2xl relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m12!1m3!1d15671.196929944358!2d76.070464!3d10.781742!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzU0LjMiTiA3NiswNCcwMS43IkU!5e0!3m2!1sen!2sin!4v1711111111111!5m2!1sen!2sin" 
              className="absolute inset-0 w-full h-full grayscale opacity-80 contrast-125"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.9)' }}
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

function ContactItem({ icon, title, value, href }: { icon: React.ReactNode, title: string, value: string, href: string }) {
  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="flex items-start gap-4 group">
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
