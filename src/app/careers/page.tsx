"use client";

import { Briefcase, Mail, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CareersPage() {
  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-[1000px]">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-16">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-pulse blur-xl" />
            <Briefcase size={40} className="text-primary relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Careers at REVOPZ</h1>
          <p className="text-muted-foreground text-lg">Join us in building reliable energy solutions for the future.</p>
        </div>

        {/* Main Content */}
        <div className="prose prose-invert max-w-none text-center mb-16">
          <p className="text-xl text-foreground/80 leading-relaxed max-w-[800px] mx-auto">
            We are always looking for passionate and talented individuals who want to contribute to the future of energy.
            At REVOPZ, we value innovation, reliability, and a commitment to excellence.
          </p>
        </div>

        {/* No Openings Section */}
        <div className="relative">
          <div className="bg-card border border-border/50 rounded-3xl p-10 md:p-16 text-center space-y-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            {/* Glow Accent */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-center">
                <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary bg-primary/5 rounded-full text-xs font-medium tracking-widest uppercase">
                  Current Status: Closed
                </Badge>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">No Current Openings</h2>
              
              <div className="space-y-4 text-muted-foreground max-w-[600px] mx-auto text-lg leading-relaxed">
                <p>
                  We are not hiring at the moment, but we are always looking for passionate talent. 
                  Please check back later for future opportunities at REVOPZ.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Info size={16} className="text-primary/70" />
                  <p className="text-sm font-medium text-foreground/60">
                    You can still reach out to us through our contact page for future consideration.
                  </p>
                </div>
              </div>
              
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild className="bg-primary hover:bg-primary/90 px-8 h-12 rounded-full group">
                  <Link href="/contact" className="flex items-center gap-2">
                    Contact Us <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-border hover:bg-muted/50 px-8 h-12 rounded-full">
                  <a href="mailto:info@revopz.com" className="flex items-center gap-2">
                    <Mail size={18} /> info@revopz.com
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Company Values */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-muted/20 border border-border/40 space-y-4 backdrop-blur-sm hover:border-primary/30 transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail size={24} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold font-headline">Innovation Driven</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Working with the latest lithium technology to solve real-world energy problems and building sustainable power systems.</p>
          </div>
          <div className="p-8 rounded-3xl bg-muted/20 border border-border/40 space-y-4 backdrop-blur-sm hover:border-primary/30 transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase size={24} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold font-headline">Professional Growth</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Opportunities to learn and grow within a fast-paced manufacturing environment alongside industry experts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
