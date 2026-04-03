
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const NAV_LINKS = [
  { name: 'Products', href: '/products' },
  { 
    name: 'About', 
    href: '#',
    subLinks: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
    ]
  },
  { name: 'Contact', href: '/contact' },
  { name: 'Warranty', href: '/warranty' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  const logoImage = PlaceHolderImages.find(img => img.id === 'company-logo');

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group transition-opacity hover:opacity-90 shrink-0">
            <div className="relative h-8 w-8 md:h-10 md:w-10 overflow-hidden rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.1)]">
              {logoImage ? (
                <Image 
                  src={logoImage.imageUrl}
                  alt="REVOPZ Logo"
                  width={40}
                  height={40}
                  className="object-contain p-1"
                  priority
                />
              ) : (
                <Zap className="text-primary w-5 h-5 md:w-6 md:h-6" />
              )}
            </div>
            <span className="font-headline text-xl md:text-2xl font-bold tracking-tighter text-foreground group-hover:text-primary transition-colors">
              REVOPZ
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <div className="flex items-center space-x-6 lg:space-x-8 mr-4 lg:mr-8">
              {NAV_LINKS.map((link) => {
                if (link.subLinks) {
                  const isSubActive = link.subLinks.some(sub => pathname === sub.href);
                  return (
                    <div key={link.name} className="relative group py-4">
                      <button
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap outline-none",
                          isSubActive ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {link.name}
                        <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                      </button>
                      {/* Dropdown Menu */}
                      <div className="absolute top-full left-0 hidden group-hover:block pt-2">
                        <div className="bg-card border border-border rounded-xl shadow-2xl min-w-[160px] overflow-hidden p-1 backdrop-blur-xl bg-card/90">
                          {link.subLinks.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={cn(
                                "block px-4 py-2 text-sm rounded-lg transition-colors",
                                pathname === sub.href 
                                  ? "bg-primary/10 text-primary font-bold" 
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 px-6">
              <Link href="/contact">Enquire Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground p-2 ml-4"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t bg-background px-4 py-6 space-y-4 max-h-[calc(100vh-64px)] overflow-y-auto">
          {NAV_LINKS.map((link) => {
            if (link.subLinks) {
              const isSubActive = link.subLinks.some(sub => pathname === sub.href);
              return (
                <div key={link.name} className="space-y-2">
                  <button
                    onClick={() => setIsAboutOpen(!isAboutOpen)}
                    className={cn(
                      "flex items-center justify-between w-full text-lg font-medium py-2 outline-none",
                      isSubActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {link.name}
                    <ChevronDown size={20} className={cn("transition-transform duration-200", isAboutOpen && "rotate-180")} />
                  </button>
                  {isAboutOpen && (
                    <div className="pl-4 space-y-2 border-l border-primary/20 ml-1">
                      {link.subLinks.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={cn(
                            "block text-base py-2",
                            pathname === sub.href ? "text-primary font-bold" : "text-muted-foreground"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "block text-lg font-medium py-2",
                  pathname === link.href ? "text-primary" : "text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4">
            <Button asChild className="w-full bg-accent hover:bg-accent/90 h-12">
              <Link href="/contact" onClick={() => setIsOpen(false)}>Enquire Now</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
