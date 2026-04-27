"use client";

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getProductBySlug } from '@/lib/products';
import {
  CheckCircle2, ChevronLeft, ArrowRight, Zap,
  Shield, Activity, ShieldCheck, Wrench
} from 'lucide-react';
import { EnquiryModal } from '@/components/EnquiryModal';
import { useState } from 'react';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  if (!product) {
    notFound();
  }

  const hasPerformance = product.performance && product.performance.length > 0;
  const hasSafety = product.safety && product.safety.length > 0;
  const hasWarranty = product.warranty;
  const hasInstallation = product.installation;
  const hasAdditionalInfo = hasWarranty || hasInstallation;

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
          <div className="space-y-10">
            {/* Title block */}
            <div className="space-y-4">
              <div className="text-sm text-primary font-bold uppercase tracking-widest">{product.category}</div>
              <h1 className="text-4xl md:text-5xl font-bold font-headline">{product.name}</h1>
              <p className="text-xl font-medium text-muted-foreground">{product.powerRating}</p>
              <p className="text-lg text-muted-foreground leading-relaxed pt-2">
                {product.fullDescription || product.shortDescription}
              </p>
            </div>

            {/* Performance Highlights */}
            {hasPerformance && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  <h3 className="text-lg font-bold font-headline">Performance Highlights</h3>
                </div>
                <ul className="space-y-2">
                  {product.performance!.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Zap size={16} className="text-accent shrink-0 mt-1" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={() => setIsEnquiryOpen(true)} className="w-full sm:w-auto px-12 py-8 text-lg bg-accent hover:bg-accent/90">
              Enquire Now
            </Button>

            {/* Key Features & Ideal For */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t">
              {product.features.length > 0 && (
                <div className="space-y-4">
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
              )}
              {product.idealFor.length > 0 && (
                <div className="space-y-4">
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
              )}
            </div>

            {/* Safety & Protection */}
            {hasSafety && (
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <h3 className="text-xl font-bold font-headline">Safety & Protection</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.safety!.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                                 bg-primary/10 text-primary border border-primary/20"
                    >
                      <ShieldCheck size={13} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specifications */}
            {Object.keys(product.specs).length > 0 && (
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
            )}

            {/* Warranty & Installation */}
            {hasAdditionalInfo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hasWarranty && (
                  <div className="flex items-start gap-3 p-5 rounded-xl border bg-card/60">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Warranty</p>
                      <p className="font-medium text-sm">{product.warranty}</p>
                    </div>
                  </div>
                )}
                {hasInstallation && (
                  <div className="flex items-start gap-3 p-5 rounded-xl border bg-card/60">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Wrench size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Installation</p>
                      <p className="font-medium text-sm">{product.installation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
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