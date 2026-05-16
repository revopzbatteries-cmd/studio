import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Calendar, Hash, Zap, User, AlertCircle } from 'lucide-react';
import { format, isValid } from 'date-fns';

interface WarrantySlipTemplateProps {
  warranty: any;
}

export function WarrantySlipTemplate({ warranty }: WarrantySlipTemplateProps) {
  if (!warranty) return null;

  const safeFormatDate = (dateVal: any, formatStr: string = "dd/MM/yyyy") => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    if (!isValid(d)) return "N/A";
    return format(d, formatStr);
  };

  return (
    <div
      id="warranty-slip-print"
      className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden print:shadow-none print:border-none print:p-0 print:rounded-none print:m-0"
    >
      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none print:opacity-[0.05]">
        <ShieldCheck size={400} />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/50 pb-8 mb-8 print:border-gray-200">
        <div className="flex items-center gap-4 mb-6 md:mb-0">
          <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center print:bg-gray-100 print:text-black text-primary">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-wider text-primary print:text-black">REVOPZ</h1>
            <p className="text-sm text-muted-foreground print:text-gray-600 font-medium tracking-widest uppercase">Official Warranty Slip</p>
          </div>
        </div>
        <div className="text-left md:text-right text-sm text-muted-foreground print:text-gray-600 space-y-1">
          <p className="font-mono">Reg ID: <span className="text-foreground font-bold print:text-black">{warranty.registrationId || warranty.id}</span></p>
          <p>Generated: {safeFormatDate(warranty.createdAt)}</p>
          <div className="flex items-center gap-1.5 md:justify-end">
            <Phone size={12} /> +91 97468 04951
          </div>
        </div>
      </div>

      {/* Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
        {/* Customer Details */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary print:text-gray-500 flex items-center gap-2">
            <User size={14} /> Customer Details
          </h2>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 print:border print:bg-gray-50">
            <p className="font-bold text-lg text-foreground print:text-black">{warranty.customerName}</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground print:text-gray-700">
              <p className="flex items-start gap-2"><Phone size={14} className="mt-0.5" /> {warranty.customerPhone}</p>
              {warranty.customerEmail && (
                <p className="flex items-start gap-2"><Mail size={14} className="mt-0.5" /> {warranty.customerEmail}</p>
              )}
              <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5" /> {warranty.address}</p>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary print:text-gray-500 flex items-center gap-2">
            <Zap size={14} /> Product Details
          </h2>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 print:border print:bg-gray-50">
            <p className="font-bold text-lg text-foreground print:text-black">{warranty.productName}</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground print:text-gray-700">
              <p className="flex items-center justify-between">
                <span>Category:</span>
                <span className="text-foreground font-medium print:text-black">{warranty.category}</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Model/Rating:</span>
                <span className="text-foreground font-medium print:text-black">{warranty.powerRating || warranty.model}</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Mfg Date:</span>
                <span className="text-foreground font-medium print:text-black">{warranty.manufacturingDate || 'N/A'}</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Installation Date:</span>
                <span className="text-foreground font-medium print:text-black">{safeFormatDate(warranty.installationDate)}</span>
              </p>
              <div className="pt-2 mt-2 border-t border-border/40 print:border-gray-300 flex items-center justify-between">
                <span className="flex items-center gap-1"><Hash size={14} /> Serial Number</span>
                <span className="text-primary font-mono font-bold print:text-black">{warranty.serialNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warranty Coverage Section */}
      <div className="mb-8 relative z-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary print:text-gray-500 flex items-center gap-2 mb-4">
          <Calendar size={14} /> Warranty Coverage
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 print:border print:bg-gray-50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Status</p>
            <p className="font-bold text-green-500 print:text-black">{(warranty.warrantyStatus || warranty.status || 'active').toUpperCase()}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 print:border print:bg-gray-50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Start Date</p>
            <p className="font-bold text-foreground print:text-black">{safeFormatDate(warranty.warrantyStartDate)}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 print:border print:bg-gray-50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">End Date</p>
            <p className="font-bold text-foreground print:text-black">{safeFormatDate(warranty.warrantyEndDate)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 print:border print:bg-gray-50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Duration</p>
            <p className="font-bold text-foreground print:text-black">24 Months</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 print:border print:bg-gray-50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Registered On</p>
            <p className="font-bold text-foreground print:text-black">{safeFormatDate(warranty.createdAt)}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 print:border print:bg-gray-50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Dealer / Installer</p>
            <p className="font-bold text-foreground print:text-black whitespace-nowrap overflow-hidden text-ellipsis" title={warranty.dealerName}>
              {warranty.dealerName || 'REVOPZ Authorized'}
            </p>
            <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">{warranty.dealerPhone}</p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-12 relative z-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground print:text-gray-500 flex items-center gap-2 mb-3">
          <AlertCircle size={14} /> Terms & Conditions
        </h2>
        <div className="text-xs text-muted-foreground print:text-gray-600 space-y-1.5 pl-5">
          <ul className="list-disc space-y-1.5">
            <li>Warranty is valid only upon verification of the physical serial number on the product.</li>
            <li>Physical damage, water damage, or electrical surges caused by improper installation are not covered.</li>
            <li>Any unauthorized repair or modification will instantly void this warranty.</li>
            <li>Please present this slip (digital or printed) during service requests.</li>
          </ul>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-16 flex justify-between items-end border-t border-border/50 pt-8 print:border-gray-300 relative z-10">
        <div className="text-center w-48">
          <div className="h-10 border-b border-border/60 mb-2 print:border-gray-400"></div>
          <p className="text-xs text-muted-foreground print:text-gray-600 uppercase tracking-wider">Customer Signature</p>
        </div>
        <div className="text-center w-48 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-20 print:opacity-30 rotate-[-15deg] pointer-events-none select-none">
            <div className="w-24 h-24 rounded-full border-4 border-primary print:border-black flex items-center justify-center text-primary print:text-black font-bold text-lg tracking-widest uppercase">
              VERIFIED
            </div>
          </div>
          <div className="h-10 border-b border-border/60 mb-2 print:border-gray-400"></div>
          <p className="text-xs text-muted-foreground print:text-gray-600 uppercase tracking-wider">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
