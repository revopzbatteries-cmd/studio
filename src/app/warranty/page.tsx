import { ShieldCheck, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function WarrantyPage() {
  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-[900px]">
        <div className="text-center space-y-4 mb-16">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Warranty & Support</h1>
          <p className="text-muted-foreground text-lg">Your peace of mind is our commitment. Read about our standard warranty coverage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-3xl bg-card border border-primary/20 space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="text-primary" />
              <h3 className="text-xl font-bold font-headline">Inverter Warranty</h3>
            </div>
            <p className="text-muted-foreground">REVOPZ Inverters come with a standard 24-month replacement warranty covering any manufacturing defects.</p>
          </div>
          <div className="p-8 rounded-3xl bg-card border border-accent/20 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-accent" />
              <h3 className="text-xl font-bold font-headline">Battery Warranty</h3>
            </div>
            <p className="text-muted-foreground">Our Lithium Battery packs are warrantied for 60 months (36 months full replacement + 24 months pro-rata).</p>
          </div>
        </div>

        <div className="bg-muted/50 p-12 rounded-3xl border border-dashed border-muted-foreground/30 text-center space-y-6">
          <AlertCircle size={48} className="text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold font-headline">Online Claims Coming Soon</h2>
          <p className="text-muted-foreground max-w-[500px] mx-auto">
            We are building a seamless digital portal for warranty tracking. Currently, warranty checking and claiming will be available soon via this website.
          </p>
          <p className="text-sm font-medium">
            For urgent support, please contact: <span className="text-primary">+91 97468 04951</span>
          </p>
        </div>

        <div className="mt-24 space-y-12">
          <h2 className="text-3xl font-bold font-headline text-center">Warranty Information</h2>
          <div className="space-y-8">
            <InfoSection 
              title="What's Covered"
              items={[
                "Any mechanical or electronic defects arising from normal usage.",
                "Performance deviation from the specified technical data sheet.",
                "Premature battery capacity degradation (exceeding 20% in first 3 years)."
              ]}
            />
            <InfoSection 
              title="What's Not Covered"
              items={[
                "Damage caused by physical abuse or external accidents.",
                "Improper installation by unauthorized technicians.",
                "Damage resulting from natural disasters or power surges beyond rated capacity."
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoSection({ title, items }: { title: string, items: string[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold font-headline flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary" /> {title}
      </h3>
      <ul className="space-y-3 pl-4">
        {items.map((item, i) => (
          <li key={i} className="text-muted-foreground flex items-start gap-3">
            <span className="text-primary font-bold">•</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}