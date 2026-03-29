import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-[800px] space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-headline">Powering a Sustainable Tomorrow</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              REVOPZ Energy Systems is a leading manufacturer of advanced lithium-ion based power backup solutions. We bridge the gap between complex energy technology and everyday reliability.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/revopz-factory/800/600"
                alt="REVOPZ Facility"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-8">
              <h2 className="text-3xl font-bold font-headline">Company Introduction</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Founded on the principles of engineering excellence and customer-centricity, REVOPZ has quickly emerged as a trusted name in the Indian energy sector.
                </p>
                <p>
                  We specialize in high-performance lithium-ion inverters and battery packs that offer superior longevity, safety, and efficiency compared to conventional systems. Our products are designed for the modern middle-class home, thriving small businesses, and a growing network of specialized dealers.
                </p>
              </div>
            </div>
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
                To become India's most trusted energy system brand by making lithium technology affordable, reliable, and simple for everyone.
              </p>
            </div>
            <div className="p-12 rounded-3xl bg-background/50 border border-accent/20 space-y-6">
              <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-white text-2xl font-bold">M</div>
              <h3 className="text-3xl font-bold font-headline">Our Mission</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Empowering every home and business with sustainable power solutions through innovative engineering and uncompromising quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CEO Message Re-use */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8 order-2 lg:order-1">
              <h2 className="text-3xl font-bold font-headline">Message from our CEO</h2>
              <p className="text-xl font-medium italic text-foreground/90 leading-relaxed border-l-4 border-primary pl-6">
                "At REVOPZ, we don't just build products; we build peace of mind. We understand that in today's world, power is not just a utility, it's a lifeline. Our goal is to ensure that your lifeline never falters."
              </p>
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
                className="rounded-3xl shadow-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}