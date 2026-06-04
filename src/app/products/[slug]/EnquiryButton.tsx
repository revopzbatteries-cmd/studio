"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnquiryModal } from '@/components/EnquiryModal';
import { ArrowRight, Send } from 'lucide-react';

interface EnquiryButtonProps {
  productName: string;
}

export function EnquiryButton({ productName }: EnquiryButtonProps) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsEnquiryOpen(true)}
        className="group relative overflow-hidden px-10 py-8 text-base font-bold uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,102,0,0.2)] hover:shadow-[0_25px_50px_rgba(255,102,0,0.3)] border-b-4 border-black/20"
      >
        <span className="relative z-10 flex items-center gap-3">
          Enquire Now
          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
        </span>
        
        {/* Animated Background Shine */}
        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 group-hover:left-[100%]" />
      </Button>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        productName={productName}
      />
    </>
  );
}
