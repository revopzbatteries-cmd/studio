"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Battery, Zap, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PRODUCTS } from '@/lib/products';
import { EnquiryModal } from '@/components/EnquiryModal';
import { useState } from 'react';

export default function Home() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-grid-white/5">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline leading-tight">
                  REVOPZ <br />
                  <span className="text-primary">Energy Systems</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                  Reliable Lithium Inverters and Batteries engineered for the next generation of homes and businesses. Safety. Efficiency. Trust.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                  <Link href="/products">View Products</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8" onClick={() => setIsEnquiryOpen(true)}>
                  Contact Us
                </Button>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-auto h-[400px] lg:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <Image
                src={PlaceHolderImages.find(img => img.id === 'hero-product')?.imageUrl || ''}
                alt="Revopz Inverter"
                width={800}
                height={600}
                className="relative z-10 rounded-2xl shadow-2xl object-cover"
                data-ai-hint="lithium inverter"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Engineered for Performance</h2>
            <p className="text-muted-foreground max-w-[700px] mx-auto">Explore our range of high-performance energy storage and conversion solutions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategoryCard 
              icon={<Zap className="text-primary" size={32} />}
              title="Lithium Inverters"
              description="High-efficiency pure sine wave inverters with smart management."
              href="/products"
            />
            <CategoryCard 
              icon={<Battery className="text-primary" size={32} />}
              title="Lithium Battery Packs"
              description="Durable LifePo4 battery modules with advanced BMS protection."
              href="/products"
            />
            <CategoryCard 
              icon={<Cpu className="text-primary" size={32} />}
              title="All-in-One Systems"
              description="Integrated energy hubs for seamless backup and control."
              href="/products"
            />
          </div>
        </div>
      </section>

      {/* Why Revopz */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Why Choose REVOPZ?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Benefit 
                  icon={<Zap className="text-accent" />}
                  title="High Efficiency"
                  text="Up to 98% conversion efficiency for minimal power loss."
                />
                <Benefit 
                  icon={<ShieldCheck className="text-accent" />}
                  title="Advanced Safety"
                  text="Multi-layer protection against surges and thermal issues."
                />
                <Benefit 
                  icon={<Battery className="text-accent" />}
                  title="Long Battery Life"
                  text="Premium cells designed for over 3000 charge cycles."
                />
                <Benefit 
                  icon={<Cpu className="text-accent" />}
                  title="Reliable Performance"
                  text="Stable output even under heavy industrial loads."
                />
              </div>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-primary/10">
              <h3 className="text-2xl font-bold font-headline mb-6" id="technology">Our Technology</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Smart Lithium Tech</h4>
                    <p className="text-sm text-muted-foreground">Automatic load balancing for optimal battery utilization.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Fast Charging</h4>
                    <p className="text-sm text-muted-foreground">Get full backup 3x faster than traditional systems.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Thermal Safety</h4>
                    <p className="text-sm text-muted-foreground">Active monitoring systems prevent overheating at all times.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline">Featured Products</h2>
              <p className="text-muted-foreground">Selected best-sellers for home and business.</p>
            </div>
            <Button asChild variant="link" className="text-primary hover:text-primary/80 group">
              <Link href="/products" className="flex items-center">
                Explore All Products <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRODUCTS.slice(0, 3).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CEO Message */}
      <section className="py-24 bg-muted/50 border-y">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-[800px]">
          <div className="mb-8 relative inline-block">
            <Image 
              src={PlaceHolderImages.find(img => img.id === 'ceo-portrait')?.imageUrl || ''}
              alt="CEO Amal Raj T P"
              width={100}
              height={100}
              className="rounded-full border-4 border-primary mx-auto"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-full">
              <Zap size={16} className="text-white" />
            </div>
          </div>
          <blockquote className="text-2xl md:text-3xl font-medium font-headline italic mb-8 text-foreground/90">
            "Reliable power should be simple and accessible for every home. We are on a mission to redefine energy independence through innovation."
          </blockquote>
          <div>
            <h4 className="text-xl font-bold font-headline">Amal Raj T P</h4>
            <p className="text-primary font-medium">CEO & Founder, REVOPZ</p>
          </div>
        </div>
      </section>

      {/* Quick Enquiry Section */}
      <section className="py-20 bg-background border-t">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold font-headline mb-8">Ready to empower your space?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => setIsEnquiryOpen(true)} className="bg-accent hover:bg-accent/90 px-8 py-6 h-auto text-lg">
              Enquire Now
            </Button>
            <Button asChild variant="outline" className="px-8 py-6 h-auto text-lg">
              <Link href="/contact">Visit Help Center</Link>
            </Button>
          </div>
        </div>
      </section>

      <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />
    </div>
  );
}

function CategoryCard({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all group flex flex-col h-full">
      <div className="mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
      <h3 className="text-xl font-bold font-headline mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{description}</p>
      <Button asChild variant="outline" className="w-full">
        <Link href={href}>View Products</Link>
      </Button>
    </div>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-bold">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <div className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all">
      <div className="relative h-64 overflow-hidden">
        <Image 
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
          New
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold font-headline">{product.name}</h3>
          <p className="text-xs text-primary font-medium">{product.powerRating}</p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.shortDescription}</p>
        <Button asChild className="w-full bg-secondary hover:bg-primary hover:text-white">
          <Link href={`/products/${product.slug}`}>View Details</Link>
        </Button>
      </div>
    </div>
  );
}