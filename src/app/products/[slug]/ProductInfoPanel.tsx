"use client";

import { CheckCircle2, Zap, ShieldCheck, Wrench, ArrowRight, Shield, BatteryCharging } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EnquiryButton } from './EnquiryButton';

interface ProductInfoPanelProps {
  product: any;
}

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const hasPerformance = product.performance && product.performance.length > 0;
  const hasSafety = product.safety && product.safety.length > 0;
  const hasFeatures = product.features && product.features.length > 0;
  const hasIdealFor = product.idealFor && product.idealFor.length > 0;
  const hasWarranty = !!product.warranty;
  const hasInstallation = !!product.installation;
  const hasSpecs = product.technicalSpecifications && Object.keys(product.technicalSpecifications).length > 0;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-right-12 duration-1000">
      
      {/* ── TOP SECTION ── */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
            <span className="text-sm font-bold uppercase tracking-[0.25em] text-blue-500">
              {product.category}
            </span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight tracking-tight text-white">
              {product.name}
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-blue-400">
              {product.powerRating || product.power}
            </p>
          </div>

          <div className="animate-in fade-in duration-700 delay-300 fill-mode-both">
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              {product.description || product.shortDescription}
            </p>
          </div>
        </div>

        {/* ── CTA Action ── */}
        <div className="pt-2">
          <EnquiryButton productName={product.name} />
        </div>
      </div>

      <div className="border-t border-border/10" />

      {/* ── SECONDARY CONTENT GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 items-start">
        
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-8">
          
          {/* Key Features */}
          {hasFeatures && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Zap size={16} className="text-blue-500 fill-blue-500/20" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold tracking-wide font-headline text-white uppercase">Key Features</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {product.features!.map((feature: string, i: number) => {
                  const icons = [CheckCircle2, Zap, ShieldCheck, BatteryCharging];
                  const Icon = icons[i % icons.length];
                  return (
                    <div 
                      key={i}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-card/20 border border-border/20 hover:border-blue-500/30 transition-all duration-300 hover:bg-card/40 shadow-sm"
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/10 shrink-0">
                        <Icon size={18} className="text-blue-500" />
                      </div>
                      <p className="text-base font-semibold text-white/90 group-hover:text-white leading-tight">{feature}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Performance Highlights */}
          {hasPerformance && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-blue-500 fill-blue-500" /> 
                <h3 className="text-lg md:text-xl font-semibold tracking-wide font-headline text-white">
                  Performance
                </h3>
              </div>
              <ul className="space-y-3">
                {product.performance!.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-3">
                    <Zap size={16} className="text-orange-500 fill-orange-500 shrink-0" />
                    <span className="text-base text-muted-foreground/90 font-medium leading-tight">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety & Protection */}
          {hasSafety && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-blue-500" />
                <h3 className="text-lg md:text-xl font-semibold tracking-wide font-headline text-white">Safety & Protection</h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.safety!.map((item: string, i: number) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-blue-500/5 text-blue-400 border-blue-500/20 hover:border-blue-400/50 transition-colors shadow-sm"
                  >
                    <CheckCircle2 size={14} className="mr-2" />
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-8">

          {/* Ideal For (Tags/Chips) */}
          {hasIdealFor && (
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-semibold tracking-wide font-headline text-white">
                Ideal For
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {product.idealFor!.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card/30 border border-border/20 text-base font-medium text-muted-foreground/90 shadow-sm">
                    <ArrowRight size={16} className="text-orange-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications */}
          {hasSpecs && (
            <div className="rounded-[1rem] bg-card/20 border border-border/20 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border/10 bg-card/40">
                <h3 className="text-lg font-semibold tracking-wide font-headline text-white">Specifications</h3>
              </div>
              <div className="flex flex-col">
                {Object.entries(product.technicalSpecifications).map(([key, value], idx) => (
                  <div 
                    key={key} 
                    className="flex justify-between items-center py-3 px-5 border-b border-border/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-base text-muted-foreground/80">{key}</span>
                    <span className="text-base font-semibold text-white text-right">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warranty & Installation */}
          {(hasWarranty || hasInstallation) && (
            <div className="grid grid-cols-2 gap-3.5">
              {hasWarranty && (
                <div className="flex flex-col justify-center p-4 rounded-xl border border-border/20 bg-card/20 hover:bg-card/30 transition-all shadow-sm">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck size={14} className="text-blue-500" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Warranty</p>
                  </div>
                  <p className="text-base md:text-lg font-semibold text-white leading-tight mt-1">{product.warranty}</p>
                </div>
              )}
              {hasInstallation && (
                <div className="flex flex-col justify-center p-4 rounded-xl border border-border/20 bg-card/20 hover:bg-card/30 transition-all shadow-sm">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Wrench size={14} className="text-blue-500" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Install</p>
                  </div>
                  <p className="text-base md:text-lg font-semibold text-white leading-tight mt-1">{product.installation}</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
