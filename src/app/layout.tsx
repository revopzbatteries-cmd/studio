import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AIAssistant } from '@/components/AIAssistant';

export const metadata: Metadata = {
  title: 'REVOPZ Energy Systems | Premium Lithium Inverters & Batteries',
  description: 'Reliable Lithium Inverters and Battery Packs for Homes and Businesses. Engineered for safety and performance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 selection:text-primary">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <AIAssistant />
        <Toaster />
      </body>
    </html>
  );
}
