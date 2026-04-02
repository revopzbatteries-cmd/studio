import Link from 'next/link';
import { Instagram, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const googleMapsUrl = "https://www.google.com/maps?q=10.781742,76.070464";

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
            <div className="flex space-x-4">
              <Link href="https://wa.me/919746804951" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
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
          <p>© {new Date().getFullYear()} REVOPZ Energy Systems. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
