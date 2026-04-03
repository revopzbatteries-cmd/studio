"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, MessageCircle, Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Footer() {
  const [mounted, setMounted] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const googleMapsUrl = "https://www.google.com/maps?q=10.781742,76.070464";
  const instagramUrl = "https://www.instagram.com/revopz._/";

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = mounted ? new Date().getFullYear() : 2026;

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <footer className="bg-muted pt-16 pb-8 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="font-headline text-2xl font-bold text-primary">
              REVOPZ
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Leading manufacturer of high-efficiency lithium-ion inverters and batteries. 
              Powering homes and businesses with reliable energy systems.
            </p>
            <div className="flex space-x-1">
              <Link 
                href="#" 
                title="LinkedIn"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                onClick={handleLinkClick}
              >
                <Linkedin size={20} />
              </Link>
              <Link 
                href="#" 
                title="X (Twitter)"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                onClick={handleLinkClick}
              >
                <Twitter size={20} />
              </Link>
              <Link 
                href="#" 
                title="Facebook"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                onClick={handleLinkClick}
              >
                <Facebook size={20} />
              </Link>
              <Link 
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Follow us on Instagram"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
              >
                <Instagram size={20} />
              </Link>
              <Link 
                href="https://wa.me/919746804951" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Chat on WhatsApp"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
              >
                <MessageCircle size={20} />
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-headline font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/products" className="hover:text-primary">Our Products</Link></li>
              <li><Link href="/warranty" className="hover:text-primary">Warranty</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold">Contact Info</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-primary" />
                <span>+91 97468 04951</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-primary" />
                <span>info@revopz.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-primary mt-1" />
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors"
                >
                  Padinjarangadi, Pattambi, Palakkad, Kerala
                </a>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold">Ready to switch?</h4>
            <p className="text-sm text-muted-foreground">Get a personalized quote for your requirement.</p>
            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/contact">Quick Enquiry</Link>
            </Button>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-muted-foreground">
          <p>
            {"© "}
            {currentYear}
            {" REVOPZ Energy Systems. All rights reserved."}
          </p>
          <div className="flex space-x-6">
            <button 
              onClick={() => setPrivacyOpen(true)} 
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setTermsOpen(true)} 
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide">
            {"Built with care by "}
            <Link href="#" className="hover:text-primary transition-colors">Navaneeth</Link>
            {" & "}
            <Link href="#" className="hover:text-primary transition-colors">Prajosh</Link>
          </p>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-[800px] bg-card border-primary/20 p-0 overflow-hidden">
          <div className="p-6 md:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-headline text-primary">Privacy Policy</DialogTitle>
              <DialogDescription>How we handle and protect your information.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <section>
                  <h3 className="text-foreground font-bold mb-2">1. Data Collection</h3>
                  <p>
                    REVOPZ Energy Systems values your privacy. We collect personal information such as your name, email address, and phone number only when you voluntarily provide it through our enquiry forms, dealership applications, or warranty registration portal.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold mb-2">2. Use of Information</h3>
                  <p>
                    This information is used strictly for communicating with you regarding your technical requests, processing your service inquiries, and managing warranty claims. We use your data to improve our service delivery and ensure your energy systems perform optimally.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold mb-2">3. Data Sharing</h3>
                  <p>
                    We do not sell, trade, or share your personal data with third parties for marketing purposes. Data may only be shared with authorized service partners or dealers specifically to fulfill a service request or warranty claim you have initiated.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold mb-2">4. Security</h3>
                  <p>
                    We implement industry-standard security measures to protect your personal information. However, please note that no method of transmission over the internet is 100% secure.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold mb-2">5. Consent</h3>
                  <p>
                    By using our website and submitting your information, you consent to our collection and use of information as described in this policy.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Modal */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-[800px] bg-card border-primary/20 p-0 overflow-hidden">
          <div className="p-6 md:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-headline text-primary">Terms & Conditions</DialogTitle>
              <DialogDescription>Rules and guidelines for using our services.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <section>
                  <h3 className="text-foreground font-bold mb-2">1. Acceptance of Terms</h3>
                  <p>
                    Welcome to REVOPZ. By accessing and using this website, you agree to comply with and be bound by these terms and conditions. If you disagree with any part of these terms, please do not use our website.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold mb-2">2. Use of Content</h3>
                  <p>
                    All content on this website, including text, graphics, logos, and product specifications, is the property of REVOPZ Energy Systems. Unauthorized use, reproduction, or distribution of this content is strictly prohibited.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold mb-2">3. Product Information</h3>
                  <p>
                    While we strive for accuracy, all product information, performance ratings, and technical specifications are subject to change without prior notice. Real-world performance may vary based on environmental factors and installation conditions.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold mb-2">4. Limitation of Liability</h3>
                  <p>
                    REVOPZ Energy Systems shall not be liable for any direct, indirect, or consequential damages arising from the use of this website or the purchase of our products beyond the scope defined in our official product warranty.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold mb-2">5. External Links</h3>
                  <p>
                    Our website may contain links to social media platforms or map services. We are not responsible for the content or privacy practices of these external sites.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold mb-2">6. Modifications</h3>
                  <p>
                    We reserve the right to modify these terms at any time. Your continued use of the site after changes are posted constitutes your acceptance of the new terms.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
