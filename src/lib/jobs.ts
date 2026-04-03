export type JobType = 'Full-time' | 'Part-time' | 'Internship';

export type Job = {
  id: string;
  title: string;
  location: string;
  type: JobType;
  description: string;
  postedAt: string;
};

export const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    title: 'Service Engineer',
    location: 'Palakkad, Kerala',
    type: 'Full-time',
    description: 'Provide technical support and maintenance for lithium inverter systems at client locations.',
    postedAt: '2024-03-20'
  },
  {
    id: '2',
    title: 'Sales Executive',
    location: 'Cochin, Kerala',
    type: 'Full-time',
    description: 'Drive sales growth and maintain relationships with our dealer network across Kerala.',
    postedAt: '2024-03-22'
  }
];
