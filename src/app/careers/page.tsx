import { Briefcase, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CareersPage() {
  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-[800px]">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-16">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Briefcase size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Careers at REVOPZ</h1>
          <p className="text-muted-foreground text-lg">Join us in building reliable energy solutions for the future.</p>
        </div>

        {/* Main Content */}
        <div className="prose prose-invert max-w-none text-center mb-16">
          <p className="text-xl text-foreground/80 leading-relaxed">
            We are always looking for passionate and talented individuals who want to contribute to the future of energy. 
            At REVOPZ, we value innovation, reliability, and a commitment to excellence.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <h2 className="text-2xl md:text-3xl font-bold font-headline">No Current Openings</h2>
          
          <div className="space-y-4 text-muted-foreground max-w-[600px] mx-auto">
            <p>We currently do not have any open positions.</p>
            <p>
              However, we are always interested in connecting with skilled professionals. 
              Feel free to reach out to us, and we will get in touch when suitable opportunities arise.
            </p>
          </div>

          <div className="pt-6">
            <p className="text-sm font-medium mb-4">You can send your resume to:</p>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 h-12 px-8">
              <a href="mailto:info@revopz.com" className="flex items-center gap-2">
                <Mail size={18} /> info@revopz.com
              </a>
            </Button>
          </div>
        </div>

        {/* Company Values / Why Join */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-muted/30 border border-border space-y-4">
            <h3 className="text-xl font-bold font-headline">Innovation Driven</h3>
            <p className="text-muted-foreground text-sm">Working with the latest lithium technology to solve real-world energy problems.</p>
          </div>
          <div className="p-8 rounded-2xl bg-muted/30 border border-border space-y-4">
            <h3 className="text-xl font-bold font-headline">Professional Growth</h3>
            <p className="text-muted-foreground text-sm">Opportunities to learn and grow within a fast-paced manufacturing environment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
