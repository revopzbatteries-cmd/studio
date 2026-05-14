"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnquiryModal } from '@/components/EnquiryModal';

interface EnquiryButtonProps {
  productName: string;
}

export function EnquiryButton({ productName }: EnquiryButtonProps) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsEnquiryOpen(true)}
        className="w-full sm:w-auto px-12 py-8 text-lg bg-accent hover:bg-accent/90"
      >
        Enquire Now
      </Button>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        productName={productName}
      />
    </>
  );
}
