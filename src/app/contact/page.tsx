"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, MapPin, MessageCircle, Loader2 } from 'lucide-react';
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

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
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
                value="Cochin, Kerala, India"
                href="#"
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
      </div>
    </div>
  );
}

function ContactItem({ icon, title, value, href }: { icon: React.ReactNode, title: string, value: string, href: string }) {
  return (
    <a href={href} className="flex items-start gap-4 group">
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