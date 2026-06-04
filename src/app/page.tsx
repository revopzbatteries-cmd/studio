"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Battery, Zap, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { EnquiryModal } from '@/components/EnquiryModal';
import { useState, useEffect } from 'react';
import { getFeaturedProducts } from '@/lib/firestoreProducts';
import type { FirestoreProduct } from '@/app/admin/types';
import { Skeleton } from '@/components/ui/skeleton';
import Product1 from '@/app/assets/images/Product1.png';

export default function Home() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<FirestoreProduct[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setIsLoadingFeatured(false);
      }
    }
    loadFeatured();
  }, []);

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
            <div className="relative aspect-square lg:aspect-auto h-[350px] lg:h-[500px] flex items-center justify-center group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full transition-all duration-700 group-hover:bg-primary/30 group-hover:scale-110" />
              <Image
                src={Product1}
                alt="Revopz Inverter"
                width={650}
                height={500}
                className="relative z-10 rounded-3xl shadow-2xl object-contain max-h-full transition-all duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-2"
                data-ai-hint="lithium inverter"
                priority
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

      {/* Brand Identity: Why REVOPZ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold font-headline">Why REVOPZ</h2>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-[600px]">
                  REVOPZ is a manufacturer of lithium-ion inverters and batteries focused on reliability, efficiency, and long-term performance. We bridge the gap between complex energy technology and everyday reliability.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                <Benefit
                  icon={<Zap size={32} />}
                  title="High Efficiency Technology"
                  text="Optimized energy conversion for maximum power savings."
                />
                <Benefit
                  icon={<ShieldCheck size={32} />}
                  title="Advanced Safety Systems"
                  text="Multi-layer protection built into every unit."
                />
                <Benefit
                  icon={<Battery size={32} />}
                  title="Long Lasting Battery Life"
                  text="Premium cells designed for thousands of cycles."
                />
                <Benefit
                  icon={<Cpu size={32} />}
                  title="Reliable Power Backup"
                  text="Seamless switching and stable output always."
                />
              </div>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-primary/10">
              <Image
                src="/images/Product2.png"
                alt="REVOPZ Quality Assurance"
                fill
                className="object-contain p-4"
                data-ai-hint="lithium battery pack"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold tracking-widest uppercase text-white">Premium Engineering</span>
                </div>
                <p className="font-headline font-bold text-lg text-white">Trusted by thousands of customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products (Dynamic from Firestore) */}
      {(isLoadingFeatured || featuredProducts.length > 0) && (
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
            <div className={
              isLoadingFeatured
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"
                : featuredProducts.length === 1
                  ? "grid grid-cols-1 max-w-sm mx-auto gap-8 w-full"
                  : featuredProducts.length === 2
                    ? "grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8 w-full"
                    : featuredProducts.length === 3
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto gap-8 w-full"
                      : featuredProducts.length === 4
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full"
                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 w-full"
            }>
              {isLoadingFeatured ? (
                <>
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <div className="hidden lg:block xl:hidden">
                    <ProductCardSkeleton />
                  </div>
                  <div className="hidden xl:block">
                    <ProductCardSkeleton />
                  </div>
                </>
              ) : (
                featuredProducts.slice(0, 5).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        </section>
      )}

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
    <div className="space-y-4">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform hover:scale-110">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-xl font-bold font-headline">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: FirestoreProduct }) {
  // Safe fallbacks
  const imageSrc = product.imageUrl || (product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages[0].url : PlaceHolderImages.find(img => img.id === 'hero-product')?.imageUrl || '/placeholder.jpg');
  const desc = product.shortDescription || product.description || 'Premium high-efficiency energy system designed for reliability and safety.';

  return (
    <div className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all h-full flex flex-col">
      <div className="relative h-64 overflow-hidden shrink-0">
        <Image
          src={imageSrc}
          alt={product.name || product.productName || 'Product Image'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
          {product.category || 'Featured'}
        </div>
      </div>
      <div className="p-6 space-y-4 flex flex-col flex-grow">
        <div>
          <h3 className="text-xl font-bold font-headline">{product.name || product.productName}</h3>
          <p className="text-xs text-primary font-medium mt-1">{product.powerRating || product.power || 'Custom Power'}</p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{desc}</p>
        <Button asChild className="w-full bg-secondary hover:bg-primary hover:text-white shrink-0 mt-4">
          <Link href={`/products/${product.slug}`}>View Details</Link>
        </Button>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border overflow-hidden h-full flex flex-col">
      <Skeleton className="h-64 w-full rounded-none shrink-0" />
      <div className="p-6 space-y-4 flex flex-col flex-grow">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-10 w-full flex-grow" />
        <Skeleton className="h-10 w-full shrink-0 mt-4" />
      </div>
    </div>
  );
}
