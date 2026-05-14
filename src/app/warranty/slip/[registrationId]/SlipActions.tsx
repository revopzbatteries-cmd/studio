'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, Loader2 } from 'lucide-react';
import Script from 'next/script';

export default function SlipActions({ filename }: { filename: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('warranty-slip-content');
      if (!element) return;

      // Ensure html2pdf is loaded from the script tag
      const html2pdf = (window as any).html2pdf;
      if (!html2pdf) {
        throw new Error('PDF library not loaded yet');
      }

      const opt = {
        margin:       10,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. You can also use the Print button to Save as PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={handlePrint} className="border-primary/50 text-primary hover:bg-primary/10">
          <Printer size={16} className="mr-2" />
          Print Slip
        </Button>
        <Button onClick={handleDownloadPdf} disabled={isDownloading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isDownloading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />}
          {isDownloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>
    </>
  );
}
