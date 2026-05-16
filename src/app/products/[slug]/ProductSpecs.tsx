"use client";

import { Activity } from 'lucide-react';

interface ProductSpecsProps {
  specs: Record<string, string>;
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  if (!specs || Object.keys(specs).length === 0) return null;

  return (
    <div className="mt-32 pt-24 border-t border-border/20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="flex flex-col items-center text-center mb-20 space-y-6">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
          <Activity size={20} className="animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Data Sheet</span>
        </div>
        <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight">Technical Excellence</h3>
        <p className="text-muted-foreground/80 max-w-2xl mx-auto text-lg font-light leading-relaxed">
          Every REVOPZ unit is built with industrial-grade components and rigorous quality control for ultimate reliability.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(specs).map(([key, value], idx) => (
            <div 
              key={key} 
              className="flex flex-col p-8 rounded-[2rem] bg-card/10 backdrop-blur-xl border border-border/20 hover:bg-card/30 transition-all duration-500 hover:border-primary/30 shadow-lg hover:shadow-[0_0_30px_rgba(255,102,0,0.1)] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
              <div className="relative z-10">
                <span className="block text-muted-foreground/60 font-bold uppercase text-[10px] tracking-[0.2em] mb-3 group-hover:text-primary/80 transition-colors">
                  {key}
                </span>
                <span className="block font-semibold text-xl tracking-tight text-foreground/90 group-hover:scale-[1.02] transition-transform origin-left">
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
