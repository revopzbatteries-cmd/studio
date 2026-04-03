import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Zap, ShieldCheck, Battery, Cpu, Home, ShoppingBag, Store, Briefcase } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-[800px] space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">
              Reliable Lithium Power Solutions <br />
              <span className="text-primary">for Homes and Businesses</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              REVOPZ Energy Systems is a manufacturer of lithium-ion based power backup solutions designed for everyday reliability. We focus on building systems that are efficient, safe, and built to last.
            </p>
          </div>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-primary/10">
              <Image 
                src="https://picsum.photos/seed/revopz-factory/800/600"
                alt="REVOPZ Facility"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-8">
              <h2 className="text-3xl font-bold font-headline">Who We Are</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  REVOPZ is built on a simple idea — reliable power should be available to everyone.
                </p>
                <p>
                  We design lithium-ion inverters and battery systems that offer longer life, faster charging, and better performance compared to traditional solutions.
                </p>
                <p>
                  Our products are made for real-world use in homes, shops, and small businesses, supported by a growing network of trusted dealers across India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose REVOPZ Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Why Choose REVOPZ</h2>
            <p className="text-muted-foreground mt-4">Engineering excellence in every unit we build.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Zap className="text-primary" />}
              title="High Efficiency Lithium Technology"
              description="Optimized for maximum power performance and energy savings."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-primary" />}
              title="Advanced Safety Protection"
              description="Multiple layers of safety built-in to protect your electronics."
            />
            <FeatureCard 
              icon={<Battery className="text-primary" />}
              title="Long Battery Life"
              description="Premium grade cells designed to last for several years."
            />
            <FeatureCard 
              icon={<Cpu className="text-primary" />}
              title="Designed for Indian Conditions"
              description="Engineered to perform reliably in all local environments."
            />
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-card border-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-12 rounded-3xl bg-background/50 border border-primary/20 space-y-6">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold">V</div>
              <h3 className="text-3xl font-bold font-headline">Our Vision</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To become a trusted energy brand in India by making lithium technology simple, reliable, and accessible for everyone.
              </p>
            </div>
            <div className="p-12 rounded-3xl bg-background/50 border border-accent/20 space-y-6">
              <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-white text-2xl font-bold">M</div>
              <h3 className="text-3xl font-bold font-headline">Our Mission</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To provide efficient and safe power solutions for homes and businesses through smart engineering and quality design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal For Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-headline">Ideal For</h2>
            <p className="text-muted-foreground mt-4">Versatile power solutions for every space.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <UseCase icon={<Home size={32} />} label="Homes" />
            <UseCase icon={<ShoppingBag size={32} />} label="Shops" />
            <UseCase icon={<Store size={32} />} label="Small Businesses" />
            <UseCase icon={<Briefcase size={32} />} label="Offices" />
          </div>
        </div>
      </section>

      {/* CEO Message */}
      <section className="py-24 bg-muted/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8 order-2 lg:order-1">
              <h2 className="text-3xl font-bold font-headline">Message from our CEO</h2>
              <div className="space-y-6">
                <p className="text-2xl font-medium italic text-foreground/90 leading-relaxed border-l-4 border-primary pl-6">
                  "At REVOPZ, we don't just build products — we build reliable power solutions you can trust every day. Our goal is simple: to ensure your power never fails when you need it most."
                </p>
              </div>
              <div>
                <h4 className="text-2xl font-bold font-headline">Amal Raj T P</h4>
                <p className="text-primary font-medium">Founder & CEO, REVOPZ</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Image 
                src={PlaceHolderImages.find(img => img.id === 'ceo-portrait')?.imageUrl || ''}
                alt="Amal Raj T P"
                width={400}
                height={400}
                className="rounded-3xl shadow-2xl mx-auto border-8 border-card"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all group">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-headline mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function UseCase({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border border-border hover:border-accent/50 transition-colors text-center">
      <div className="text-accent">{icon}</div>
      <span className="font-bold font-headline">{label}</span>
    </div>
  );
}
