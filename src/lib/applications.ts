export type ApplicationStatus = 'New' | 'Under Review' | 'Shortlisted' | 'Rejected';

export type JobApplication = {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  jobTitle: string;
  message: string;
  status: ApplicationStatus;
  submittedAt: string;
};

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    applicantName: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+91 98765 43210',
    jobTitle: 'Junior Service Technician',
    message: 'I have 2 years of experience in solar panel maintenance and basic electrical wiring. I am very interested in working with lithium technology and learning about smart BMS systems.',
    status: 'New',
    submittedAt: '2024-03-26'
  }
];
