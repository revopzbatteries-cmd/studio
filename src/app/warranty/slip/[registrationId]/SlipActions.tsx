'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, Loader2 } from 'lucide-react';
import Script from 'next/script';
import { useToast } from '@/hooks/use-toast';

export default function SlipActions({ filename }: { filename: string }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      // 1. Wait for fonts and images to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = document.getElementById('warranty-slip-print');
      if (!element) throw new Error('Target element not found');

      // 2. Load dependencies manually if not already present
      const html2canvas = (window as any).html2canvas;
      const { jsPDF } = (window as any).jspdf;

      if (!html2canvas || !jsPDF) {
        throw new Error('PDF libraries not fully loaded. Please wait a moment and try again.');
      }

      // 3. Prepare element for capture (ensure no cropping)
      const originalStyle = element.style.cssText;
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.width = '800px'; // Lock width for consistent rendering

      // 4. Capture with high-DPI
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#020817", // Matches REVOPZ dark theme
        logging: false,
        allowTaint: true,
        windowWidth: 800,
      });

      // 5. Restore original styles
      element.style.cssText = originalStyle;

      // 6. Calculate A4 dimensions
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 20; // 10mm margin
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is taller than A4, we add it centered or multi-page if needed
      // For warranty slip, usually one page fits or we scale down slightly
      let finalY = 10;
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;

      if (imgHeight > (pageHeight - 20)) {
        // Content is very long, scale to fit height
        finalHeight = pageHeight - 20;
        finalWidth = (canvas.width * finalHeight) / canvas.height;
      }

      const xOffset = (pageWidth - finalWidth) / 2;

      pdf.addImage(imgData, 'JPEG', xOffset, finalY, finalWidth, finalHeight, undefined, 'FAST');
      pdf.save(filename);

      toast({
        title: "✅ Download Successful",
        description: "Your warranty slip has been saved.",
      });

    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "❌ Export Failed",
        description: error.message || "Failed to generate PDF. Use 'Print' as a fallback.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={handlePrint} className="border-primary/50 text-primary hover:bg-primary/10">
          <Printer size={16} className="mr-2" />
          Print Slip
        </Button>
        <Button onClick={handleDownloadPdf} disabled={isDownloading} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[160px]">
          {isDownloading ? (
            <><Loader2 size={16} className="animate-spin mr-2" /> Generating...</>
          ) : (
            <><Download size={16} className="mr-2" /> Download PDF</>
          )}
        </Button>
      </div>
    </>
  );
}
