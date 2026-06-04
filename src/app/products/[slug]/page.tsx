import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getProductBySlugServer } from '@/lib/products-server';
import { ChevronLeft } from 'lucide-react';
import { ProductGallery } from '@/app/products/[slug]/ProductGallery';
import { ProductInfoPanel } from '@/app/products/[slug]/ProductInfoPanel';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);

  if (!product) {
    notFound();
  }

  // Build gallery image list — prefer galleryImages, fall back to imageUrl
  const galleryImages: { url: string; isMain: boolean }[] =
    product.galleryImages && product.galleryImages.length > 0
      ? product.galleryImages
      : product.imageUrl
        ? [{ url: product.imageUrl, isMain: true }]
        : [];

  return (
    <div className="min-h-screen bg-background pb-32 overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground">
      {/* ── Cinematic Background Glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] opacity-40 animate-pulse duration-[10s]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[140px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/2 rounded-full blur-[160px] opacity-50" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Navigation - Minimalist Back Link */}
        <div className="pt-10 mb-16 animate-in fade-in slide-in-from-left-6 duration-700">
          <Button asChild variant="ghost" className="hover:text-primary group px-0 -ml-2 text-muted-foreground/60 transition-colors">
            <Link href="/products" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-card border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all">
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Explore Collection</span>
            </Link>
          </Button>
        </div>

        {/* ── Main Showcase Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Side: Immersive Sticky Gallery (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 animate-in fade-in slide-in-from-left-12 duration-1000">
            <ProductGallery images={galleryImages} productName={product.name} />
          </div>

          {/* Right Side: Detailed Information (7 cols) */}
          <div className="lg:col-span-7 lg:pl-4">
            <ProductInfoPanel product={product} />
          </div>
        </div>

        {/* ── Footer Call to Action ── */}
        <div className="mt-48 text-center space-y-10 animate-in fade-in duration-1000 delay-500">
          <div className="h-px w-full max-w-2xl mx-auto bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="max-w-xl mx-auto">
            <p className="text-xl text-muted-foreground/90 font-medium mb-6 leading-relaxed">
              "Powering the future with precision engineering and sustainable innovation."
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/5 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Designed for Excellence
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}