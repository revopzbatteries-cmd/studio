"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from '@/lib/products';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'inverters' | 'batteries' | 'systems'>('all');

  const filteredProducts = activeCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Power Range</h1>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Discover a comprehensive suite of lithium-powered solutions tailored for diverse energy needs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <FilterButton 
            active={activeCategory === 'all'} 
            onClick={() => setActiveCategory('all')}
            label="All Systems"
          />
          <FilterButton 
            active={activeCategory === 'inverters'} 
            onClick={() => setActiveCategory('inverters')}
            label="Inverters"
          />
          <FilterButton 
            active={activeCategory === 'batteries'} 
            onClick={() => setActiveCategory('batteries')}
            label="Batteries"
          />
          <FilterButton 
            active={activeCategory === 'systems'} 
            onClick={() => setActiveCategory('systems')}
            label="All-in-One"
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-card rounded-2xl border overflow-hidden hover:shadow-2xl transition-all border-primary/5 hover:border-primary/20">
              <div className="relative h-72">
                <Image 
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">{product.category}</div>
                  <h3 className="text-2xl font-bold font-headline group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{product.powerRating}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.shortDescription}
                </p>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href={`/products/${product.slug}`}>View Full Specifications</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={cn(
        "rounded-full px-8 py-6 text-sm font-medium",
        active ? "bg-primary text-white" : "border-border hover:border-primary/50"
      )}
    >
      {label}
    </Button>
  );
}