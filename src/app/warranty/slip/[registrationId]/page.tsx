import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import { ShieldCheck } from 'lucide-react';
import SlipActions from '@/app/warranty/slip/[registrationId]/SlipActions';
import { WarrantySlipTemplate } from '@/app/warranty/components/WarrantySlipTemplate';

export const metadata = {
  title: 'Official Warranty Slip | REVOPZ',
};

async function getWarranty(registrationId: string) {
  try {
    const doc = await adminDb.collection('warranties').doc(registrationId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    return null;
  }
}

export default async function WarrantySlipPage({ params }: { params: Promise<{ registrationId: string }> }) {
  const { registrationId } = await params;
  const warranty: any = await getWarranty(registrationId);

  if (!warranty) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 print:py-0 print:bg-white print:text-black">
      <div className="max-w-[800px] mx-auto px-4 print:px-0">
        {/* Action Buttons (Hidden when printing) */}
        <div className="print:hidden mb-8 flex justify-end">
          <SlipActions filename={`REVOPZ-Warranty-${warranty.serialNumber}.pdf`} />
        </div>

        {/* The Printable Slip */}
        <div className="relative">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #warranty-slip-print,
              #warranty-slip-print * {
                visibility: visible;
              }
              #warranty-slip-print {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                margin: 0;
                padding: 0;
              }
              
              @page { margin: 15mm; size: A4 portrait; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
            }
          `}} />

          <WarrantySlipTemplate warranty={warranty} />
        </div>
      </div>
    </div>
  );
}

