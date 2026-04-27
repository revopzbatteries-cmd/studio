import { PlaceHolderImages } from './placeholder-images';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: 'inverters' | 'batteries' | 'systems';
  powerRating: string;
  shortDescription: string;
  fullDescription: string;
  performance: string[];
  features: string[];
  safety: string[];
  specs: Record<string, string>;
  idealFor: string[];
  image: string;
  warranty?: string;
  installation?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'lithium-inverter-1kva',
    name: 'Lithium Inverter 1kVA',
    category: 'inverters',
    powerRating: '1000VA / 800W',
    shortDescription: 'Compact and efficient power solution for small homes and apartments.',
    fullDescription: 'The REVOPZ 1kVA system is engineered for efficiency, providing seamless power backup for your essential home electronics. It features smart lithium management for extended battery life.',
    performance: [
      'High efficiency power conversion',
      'Seamless switching under 10ms',
      'Optimised for lithium battery charging'
    ],
    features: [
      'Pure Sine Wave Output',
      'Smart LCD Display',
      'Overload Protection',
      'Rapid Charge Technology'
    ],
    safety: [
      'Overload Protection',
      'Short Circuit Protection',
      'Thermal Shutdown'
    ],
    specs: {
      'Input Voltage': '180V - 260V',
      'Output Voltage': '230V ± 5%',
      'Efficiency': '> 92%',
      'Charging Current': '10A - 20A'
    },
    idealFor: ['LED Bulbs', 'Fans', 'Laptops', 'Wi-Fi Routers'],
    image: PlaceHolderImages.find(img => img.id === 'inverter-1kva')?.imageUrl || '',
    warranty: '2 Years Standard Warranty',
    installation: 'Wall Mount / Floor Stand'
  },
  {
    id: '2',
    slug: 'lithium-inverter-3kva',
    name: 'Lithium Inverter 3kVA',
    category: 'inverters',
    powerRating: '3000VA / 2400W',
    shortDescription: 'Heavy-duty performance for larger homes and small business setups.',
    fullDescription: 'Our 3kVA inverter is a powerhouse designed to handle sophisticated loads with ease. Integrated with advanced safety protocols, it ensures your sensitive equipment stays protected.',
    performance: [
      'Fast charging capability',
      'Supports heavy appliances & air conditioners',
      '> 95% conversion efficiency'
    ],
    features: [
      'High Surge Capacity',
      'Eco-Mode Operation',
      'Dual Stage Protection',
      'External Battery Support'
    ],
    safety: [
      'Overload Protection',
      'Short Circuit Protection',
      'Thermal Protection',
      'Battery Reverse Polarity'
    ],
    specs: {
      'Input Voltage': '160V - 280V',
      'Output Voltage': '230V ± 2%',
      'Efficiency': '> 95%',
      'Transfer Time': '< 10ms'
    },
    idealFor: ['Air Conditioners', 'Refrigerators', 'Desktop Computers', 'Water Pumps'],
    image: PlaceHolderImages.find(img => img.id === 'inverter-3kva')?.imageUrl || '',
    warranty: '2 Years Standard Warranty',
    installation: 'Floor Stand'
  },
  {
    id: '3',
    slug: 'lithium-battery-12v',
    name: 'Lithium Battery 12V',
    category: 'batteries',
    powerRating: '100Ah / 1200Wh',
    shortDescription: 'Long-lasting energy storage with thousands of cycles.',
    fullDescription: 'Premium grade LifePo4 cells packed into a rugged casing. This 12V module is the perfect companion for your inverter, offering 3x the life of traditional lead-acid batteries.',
    performance: [
      '3x longer life than lead-acid',
      'Consistent power delivery',
      'Rapid charge acceptance'
    ],
    features: [
      'Intelligent BMS',
      'Lightweight Design',
      'Zero Maintenance',
      'Safe LifePo4 Chemistry'
    ],
    safety: [
      'Overcharge Protection',
      'Over-discharge Protection',
      'Short Circuit Protection',
      'Temperature Control'
    ],
    specs: {
      'Nominal Voltage': '12.8V',
      'Capacity': '100Ah',
      'Cycle Life': '> 3000 Cycles',
      'Weight': '12.5 kg'
    },
    idealFor: ['Inverter Backup', 'Solar Storage', 'Electric Vehicles', 'Marine Use'],
    image: PlaceHolderImages.find(img => img.id === 'battery-12v')?.imageUrl || '',
    warranty: '3 Years Standard Warranty',
    installation: 'Horizontal / Vertical Mounting'
  }
];

export function getProductBySlug(slug: string) {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getProductsByCategory(category: string) {
  return PRODUCTS.filter(p => p.category === category);
}