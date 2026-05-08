// Shared types for the Admin Product Management system

export type AdminProduct = {
  id: string;
  name: string;
  category: 'inverters' | 'batteries' | 'systems';
  powerRating: string;
  description: string;
  image: string;
  performance: string[];
  features: string[];
  safety: string[];
  idealFor: string[];
  specifications: { key: string; value: string }[];
  warranty: string;
  installation: string;
};
