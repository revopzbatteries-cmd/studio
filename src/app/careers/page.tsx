"use client";

import { useState, useEffect } from 'react';
import { Briefcase, Mail, MapPin, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job, INITIAL_JOBS } from '@/lib/jobs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { JobApplication, INITIAL_APPLICATIONS } from '@/lib/applications';

export default function CareersPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const savedJobs = localStorage.getItem('revopz_jobs');
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    } else {
      setJobs(INITIAL_JOBS);
    }
  }, []);

  const handleApplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsApplying(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newApp: JobApplication = {
      id: Math.random().toString(36).substr(2, 9),
      applicantName: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      jobTitle: selectedJob?.title || 'General Inquiry',
      message: formData.get('message') as string,
      status: 'New',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    // Simulate saving to shared storage
    const existingAppsJson = localStorage.getItem('revopz_applications');
    const existingApps: JobApplication[] = existingAppsJson ? JSON.parse(existingAppsJson) : INITIAL_APPLICATIONS;
    localStorage.setItem('revopz_applications', JSON.stringify([newApp, ...existingApps]));

    setTimeout(() => {
      setIsApplying(false);
      setIsApplyModalOpen(false);
      toast({
        title: "Application Received",
        description: `Your application for ${selectedJob?.title} has been submitted successfully.`,
      });
      form.reset();
    }, 1500);
  };

  const openApplyModal = (job: Job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-[1000px]">
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
          <p className="text-xl text-foreground/80 leading-relaxed max-w-[800px] mx-auto">
            We are always looking for passionate and talented individuals who want to contribute to the future of energy. 
            At REVOPZ, we value innovation, reliability, and a commitment to excellence.
          </p>
        </div>

        {/* Dynamic Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-headline mb-4">Open Positions</h2>
            {jobs.length === 0 && (
              <p className="text-muted-foreground">No current openings. Please check back later.</p>
            )}
          </div>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all group flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold font-headline group-hover:text-primary transition-colors">{job.title}</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{job.type}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-primary" /> {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-primary" /> {job.type}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                  <Button onClick={() => openApplyModal(job)} className="mt-6 w-full bg-primary hover:bg-primary/90">
                    Apply Now
                  </Button>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>

        {/* Company Values */}
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

      {/* Application Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>Submit your details and we will get in touch shortly.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplySubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required className="bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required className="bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+91 00000 00000" required className="bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message / Cover Letter</Label>
              <Textarea id="message" name="message" placeholder="Tell us why you're a good fit..." required className="bg-muted/50 min-h-[100px]" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isApplying}>
                {isApplying ? <Loader2 className="animate-spin mr-2" /> : null}
                {isApplying ? 'Submitting...' : 'Submit Application'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
