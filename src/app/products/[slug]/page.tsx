"use client";

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getProductBySlug } from '@/lib/products';
import { CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';
import { EnquiryModal } from '@/components/EnquiryModal';
import { useState } from 'react';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 md:px-6">
        <Button asChild variant="ghost" className="mb-12 hover:text-primary pl-0">
          <Link href="/products" className="flex items-center gap-2">
            <ChevronLeft size={16} /> Back to Products
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Product Image */}
          <div className="relative aspect-square lg:h-[600px] rounded-3xl overflow-hidden border bg-card/50">
            <Image 
              src={product.image}
              alt={product.name}
              fill
              className="object-cover p-8 md:p-12"
            />
          </div>

          {/* Right: Product Details */}
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="text-sm text-primary font-bold uppercase tracking-widest">{product.category}</div>
              <h1 className="text-4xl md:text-5xl font-bold font-headline">{product.name}</h1>
              <p className="text-xl font-medium text-muted-foreground">{product.powerRating}</p>
              <p className="text-lg text-muted-foreground leading-relaxed pt-4">
                {product.fullDescription}
              </p>
            </div>

            <Button onClick={() => setIsEnquiryOpen(true)} className="w-full sm:w-auto px-12 py-8 text-lg bg-accent hover:bg-accent/90">
              Enquire Now
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t">
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-headline">Key Features</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-headline">Ideal For</h3>
                <ul className="space-y-3">
                  {product.idealFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <ArrowRight size={18} className="text-accent shrink-0 mt-1" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-card p-8 rounded-2xl border">
              <h3 className="text-xl font-bold font-headline mb-6">Technical Specifications</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <EnquiryModal 
        isOpen={isEnquiryOpen} 
        onClose={() => setIsEnquiryOpen(false)} 
        productName={product.name} 
      />
    </div>
  );
}