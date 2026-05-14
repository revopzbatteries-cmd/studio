import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, ShieldCheck } from 'lucide-react';

export default function WarrantyNotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border/50 rounded-3xl p-10 shadow-xl">
        <div className="mx-auto w-20 h-20 bg-destructive/10 text-destructive flex items-center justify-center rounded-full">
          <AlertCircle size={40} />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2">Slip Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find a warranty registration matching this ID. It may have been typed incorrectly or does not exist in our system.
          </p>
        </div>

        <div className="p-4 bg-muted/40 rounded-xl text-sm text-left border border-border/40">
          <p className="font-semibold mb-1 flex items-center gap-2"><ShieldCheck size={14} className="text-primary" /> Need Help?</p>
          <p className="text-muted-foreground">If you believe this is an error, please contact our support team at <strong>+91 97468 04951</strong>.</p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Home size={18} className="mr-2" /> Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
