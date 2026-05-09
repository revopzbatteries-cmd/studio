"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  UserCircle,
  Plus,
  Edit,
  Trash2,
  LogOut,
  CheckCircle2,
  X,
  ImageIcon,
  Briefcase,
  FileText,
  Search,
  Eye,
  AlertTriangle,
  Factory,
  Lock,
  CalendarDays,
  Loader2,
  Key,
  EyeOff,
  Copy,
  RefreshCcw
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { PRODUCTS as initialProducts, Product } from '@/lib/products';
import { Job, INITIAL_JOBS, JobType } from '@/lib/jobs';
import { JobApplication, INITIAL_APPLICATIONS, ApplicationStatus } from '@/lib/applications';
import { WarrantyEntry, INITIAL_WARRANTIES, WarrantyStatus } from '@/lib/warranty';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProductForm } from './components/ProductForm';
import type { AdminProduct } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Role, Can, hasPermission } from '@/lib/rbac';
import { generateSecurePassword } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, addAdminSchema, LoginFormData, AddAdminFormData, checkPasswordStrength } from '@/lib/validations';

// Types
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export default function AdminPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, logout } = useAuth();
  
  // MOCK ROLE FOR TESTING: You can switch this state to 'Product Manager' or 'Production Unit' to test RBAC logic.
  const [mockRole, setMockRole] = useState<Role>('Manager');
  
  const [activeTab, setActiveTab] = useState('profile');

  // Login State
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  // Data State
  const [admins, setAdmins] = useState<AdminUser[]>([
    { id: '1', name: 'Amal Raj T P', email: 'amal@revopz.com', role: 'Manager' }
  ]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [warranties, setWarranties] = useState<WarrantyEntry[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Initialize and Sync Data
  useEffect(() => {
    // Sync Jobs
    const savedJobs = localStorage.getItem('revopz_jobs');
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    } else {
      setJobs(INITIAL_JOBS);
      localStorage.setItem('revopz_jobs', JSON.stringify(INITIAL_JOBS));
    }

    // Sync Applications
    const savedApps = localStorage.getItem('revopz_applications');
    if (savedApps) {
      setApplications(JSON.parse(savedApps));
    } else {
      setApplications(INITIAL_APPLICATIONS);
      localStorage.setItem('revopz_applications', JSON.stringify(INITIAL_APPLICATIONS));
    }

    // Sync Warranties
    const savedWarranties = localStorage.getItem('revopz_warranties');
    if (savedWarranties) {
      setWarranties(JSON.parse(savedWarranties));
    } else {
      setWarranties(INITIAL_WARRANTIES);
      localStorage.setItem('revopz_warranties', JSON.stringify(INITIAL_WARRANTIES));
    }
  }, []);

  const handleUpdateJobs = (newJobs: Job[]) => {
    setJobs(newJobs);
    localStorage.setItem('revopz_jobs', JSON.stringify(newJobs));
  };

  const handleUpdateApps = (newApps: JobApplication[]) => {
    setApplications(newApps);
    localStorage.setItem('revopz_applications', JSON.stringify(newApps));
  };

  const handleUpdateWarranties = (newWarranties: WarrantyEntry[]) => {
    setWarranties(newWarranties);
    localStorage.setItem('revopz_warranties', JSON.stringify(newWarranties));
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setIsLoggingIn(true);
      console.log(`[Auth Debug] Attempting sign in for: ${data.email}`);

      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log(`[Auth Debug] Login successful for: ${userCredential.user.email}`);
      // onAuthStateChanged in AuthContext will pick up the new user automatically.
      // The page will re-render from !user → authenticated dashboard instantly.
      toast({ title: "Login Successful", description: "Welcome to the REVOPZ Admin Panel." });

    } catch (error: any) {
      console.warn("[Auth] Sign-in failed. Code:", error.code);

      if (error.code === 'auth/user-not-found') {
        // Legacy SDK: email not registered
        toast({
          title: "Access Denied",
          description: "You don't have any access.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/wrong-password') {
        // Legacy SDK: email exists but password wrong
        toast({
          title: "Incorrect Password",
          description: "Incorrect password. Please contact the super admin.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/invalid-credential') {
        // Modern Firebase SDK (v9+): covers both wrong email AND wrong password.
        // We cannot distinguish them without email enumeration (which is a security risk).
        // Show a combined message — the most common case here is wrong password
        // since this is an admin-only system with a known fixed email.
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please check your email and password, or contact the super admin.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/invalid-email') {
        toast({
          title: "Invalid Email",
          description: "The email address format is not valid.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/too-many-requests') {
        toast({
          title: "Account Temporarily Locked",
          description: "Too many failed attempts. Please try again later or reset your password.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/network-request-failed') {
        toast({
          title: "Network Error",
          description: "Something went wrong. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged Out", description: "You have been logged out of the admin panel." });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
              <LayoutDashboard className="text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the REVOPZ control center.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@revopz.com"
                  {...registerLogin('email')}
                  className={`bg-background ${loginErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {loginErrors.email && <p className="text-sm text-destructive font-medium">{loginErrors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...registerLogin('password')}
                  className={`bg-background ${loginErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {loginErrors.password && <p className="text-sm text-destructive font-medium">{loginErrors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-all" disabled={isLoggingIn}>
                {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</> : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight">REVOPZ Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Can role={mockRole} perform="manage_admins">
            <SidebarButton
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
              icon={<UserCircle size={20} />}
              label="Admin Profile"
            />
          </Can>
          <Can role={mockRole} perform="manage_products">
            <SidebarButton
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              icon={<Package size={20} />}
              label="Product Mgmt"
            />
          </Can>
          <Can role={mockRole} perform="manage_units">
            <SidebarButton
              active={activeTab === 'units'}
              onClick={() => setActiveTab('units')}
              icon={<Factory size={20} />}
              label="Manufactured Units"
            />
          </Can>
          <Can role={mockRole} perform="view_warranty">
            <SidebarButton
              active={activeTab === 'warranty'}
              onClick={() => setActiveTab('warranty')}
              icon={<ShieldCheck size={20} />}
              label="Warranty Mgmt"
            />
          </Can>
          <Can role={mockRole} perform="manage_careers">
            <SidebarButton
              active={activeTab === 'careers'}
              onClick={() => setActiveTab('careers')}
              icon={<Briefcase size={20} />}
              label="Career Mgmt"
            />
            <SidebarButton
              active={activeTab === 'applications'}
              onClick={() => setActiveTab('applications')}
              icon={<FileText size={20} />}
              label="Applications"
            />
          </Can>
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut size={20} className="mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline capitalize">
                {activeTab === 'profile' ? 'Profile Management' :
                  activeTab === 'products' ? 'Product Catalog' :
                    activeTab === 'units' ? 'Manufactured Units' :
                      activeTab === 'warranty' ? 'Warranty Registry' :
                        activeTab === 'careers' ? 'Career Management' : 'Job Applications'}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'units'
                  ? 'Manage manufactured products and track warranty-ready units.'
                  : 'Manage your REVOPZ system operations and data.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Switcher for Testing */}
              <Select value={mockRole} onValueChange={(v: Role) => setMockRole(v)}>
                <SelectTrigger className="w-[180px] h-8 text-xs bg-primary/10 border-primary/20">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Manager">Mock: Manager</SelectItem>
                  <SelectItem value="Product Manager">Mock: Product Mgr</SelectItem>
                  <SelectItem value="Production Unit">Mock: Prod Unit</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden md:flex flex-col items-end">
                <span className="font-bold text-sm">Amal Raj T P</span>
                <span className="text-xs text-primary font-medium">{mockRole}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                AR
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {activeTab === 'profile' && <ProfileSection admins={admins} setAdmins={setAdmins} mockRole={mockRole} />}
            {activeTab === 'products' && <ProductSection products={products} setProducts={setProducts} mockRole={mockRole} />}
            {activeTab === 'units' && <ManufacturedUnitsSection mockRole={mockRole} />}
            {activeTab === 'warranty' && <WarrantyManagementSection warranties={warranties} setWarranties={handleUpdateWarranties} products={products} mockRole={mockRole} />}
            {activeTab === 'careers' && <CareerManagementSection jobs={jobs} setJobs={handleUpdateJobs} mockRole={mockRole} />}
            {activeTab === 'applications' && <ApplicationsSection applications={applications} setApplications={handleUpdateApps} mockRole={mockRole} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProfileSection({ admins, setAdmins, mockRole }: { admins: AdminUser[], setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>, mockRole: Role }) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetAdmin, setResetAdmin] = useState<AdminUser | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  // ── React Hook Form setup ──────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<AddAdminFormData>({
    resolver: zodResolver(addAdminSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', role: 'Product Manager', password: '' }
  });

  const watchedPassword = watch('password', '');
  const passwordConditions = checkPasswordStrength(watchedPassword);
  const passwordMet = passwordConditions.filter(c => c.met).length;
  const passwordStrength = passwordMet === 5 ? 'strong' : passwordMet >= 3 ? 'medium' : 'weak';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGeneratePassword = () => {
    const p = generateSecurePassword(12);
    setValue('password', p, { shouldValidate: true });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Password copied to clipboard." });
    } catch {
      toast({ title: "Error", description: "Failed to copy.", variant: "destructive" });
    }
  };

  const onAddAdminSubmit = async (data: AddAdminFormData) => {
    setIsSubmitting(true);
    // Simulate a brief async operation (replace with Firebase call later)
    await new Promise(r => setTimeout(r, 500));
    const newAdmin: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: data.role
    };
    setAdmins(prev => [...prev, newAdmin]);
    toast({ title: "Admin Added", description: `${newAdmin.name} is now a ${newAdmin.role}.` });
    reset();
    setShowPassword(false);
    setIsAddDialogOpen(false);
    setIsSubmitting(false);
  };

  const handleGenerateResetPassword = () => {
    setResetPasswordVal(generateSecurePassword(12));
  };

  const handleConfirmReset = () => {
    toast({ title: "Password Reset", description: `Password for ${resetAdmin?.name} has been reset.` });
    setResetAdmin(null);
    setResetPasswordVal('');
  };

  const getRoleBadge = (r: Role) => {
    switch(r) {
      case 'Manager': return <Badge className="bg-primary">Manager</Badge>;
      case 'Product Manager': return <Badge className="bg-blue-500">Product Manager</Badge>;
      case 'Production Unit': return <Badge className="bg-orange-500">Production Unit</Badge>;
      default: return <Badge>{r}</Badge>;
    }
  };

  // Strength indicator styles
  const strengthBarClass = passwordStrength === 'strong'
    ? 'bg-green-500'
    : passwordStrength === 'medium'
    ? 'bg-yellow-500'
    : 'bg-destructive';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white mb-4 border-4 border-background">
                AR
              </div>
              <h3 className="font-bold text-xl">Amal Raj T P</h3>
              <p className="text-muted-foreground text-sm">amal@revopz.com</p>
              <div className="mt-2">{getRoleBadge(mockRole)}</div>
            </div>
            <div className="pt-4 border-t border-primary/10 space-y-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">Permissions</p>
              <ul className="text-sm space-y-1">
                {hasPermission(mockRole, 'manage_admins') && <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Manage Admins</li>}
                {hasPermission(mockRole, 'manage_products') && <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Product Catalog</li>}
                {hasPermission(mockRole, 'manage_units') && <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Production Units</li>}
                {hasPermission(mockRole, 'view_warranty') && <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> View Warranties</li>}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">System Administrators</CardTitle>
              <CardDescription>Manage team access and roles.</CardDescription>
            </div>
            <Can role={mockRole} perform="manage_admins">
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                if (!open) { reset(); setShowPassword(false); }
                setIsAddDialogOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90"><Plus size={16} className="mr-2" /> Add Admin</Button>
                </DialogTrigger>
                <DialogContent className="bg-card sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Administrator</DialogTitle>
                    <DialogDescription>Assign system access and create credentials.</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit(onAddAdminSubmit)} noValidate>
                    <div className="grid gap-4 py-4">

                      {/* Full Name */}
                      <div className="space-y-1">
                        <Label htmlFor="admin-name">Full Name</Label>
                        <Input
                          id="admin-name"
                          placeholder="e.g. John Smith"
                          {...register('name')}
                          className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive font-medium flex items-center gap-1">
                            <X size={12} /> {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="email@revopz.com"
                          {...register('email')}
                          className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive font-medium flex items-center gap-1">
                            <X size={12} /> {errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Role */}
                      <div className="space-y-1">
                        <Label>Role</Label>
                        <Select
                          defaultValue="Product Manager"
                          onValueChange={(v: Role) => setValue('role', v, { shouldValidate: true })}
                        >
                          <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Product Manager">Product Manager</SelectItem>
                            <SelectItem value="Production Unit">Production Unit</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.role && (
                          <p className="text-xs text-destructive font-medium flex items-center gap-1">
                            <X size={12} /> {errors.role.message}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="admin-password">Temporary Password</Label>
                          <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleGeneratePassword}>
                            <RefreshCcw size={12} className="mr-1" /> Auto-generate
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            id="admin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register('password')}
                            className={`pr-20 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(watchedPassword)} disabled={!watchedPassword}>
                              <Copy size={14} />
                            </Button>
                          </div>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-destructive font-medium flex items-center gap-1">
                            <X size={12} /> {errors.password.message}
                          </p>
                        )}

                        {/* Password Strength Bar + Checklist */}
                        {watchedPassword.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${strengthBarClass}`}
                                  style={{ width: `${(passwordMet / 5) * 100}%` }}
                                />
                              </div>
                              <span className={`text-xs font-semibold capitalize ${
                                passwordStrength === 'strong' ? 'text-green-500' :
                                passwordStrength === 'medium' ? 'text-yellow-500' : 'text-destructive'
                              }`}>
                                {passwordStrength}
                              </span>
                            </div>
                            <ul className="space-y-1">
                              {passwordConditions.map((c) => (
                                <li key={c.label} className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${c.met ? 'text-green-500' : 'text-muted-foreground'}`}>
                                  {c.met ? <CheckCircle2 size={11} /> : <X size={11} />}
                                  {c.label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                      <Button type="submit" disabled={!isValid || isSubmitting} className="min-w-[160px]">
                        {isSubmitting ? <><Loader2 size={14} className="mr-2 animate-spin" /> Creating...</> : 'Create Administrator'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </Can>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <Can role={mockRole} perform="reset_passwords"><TableHead className="text-right">Actions</TableHead></Can>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell>
                      {getRoleBadge(admin.role)}
                    </TableCell>
                    <Can role={mockRole} perform="reset_passwords">
                      <TableCell className="text-right">
                        <Dialog open={resetAdmin?.id === admin.id} onOpenChange={(open) => { if (!open) { setResetAdmin(null); setResetPasswordVal(''); } }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:text-primary text-xs" onClick={() => { setResetAdmin(admin); handleGenerateResetPassword(); }}>
                              <Key size={14} className="mr-1" /> Reset Pass
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card sm:max-w-sm">
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>Generate a new password for {admin.name}.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <div className="p-4 bg-muted/50 rounded-lg border flex flex-col items-center justify-center space-y-3">
                                <span className="text-sm text-muted-foreground">New Password</span>
                                <span className="font-mono text-lg font-bold tracking-wider break-all text-center">{resetPasswordVal}</span>
                                <div className="flex gap-2">
                                  <Button variant="secondary" size="sm" onClick={() => copyToClipboard(resetPasswordVal)}>
                                    <Copy size={14} className="mr-2" /> Copy
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={handleGenerateResetPassword}>
                                    <RefreshCcw size={14} className="mr-1" /> Regenerate
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground text-center">
                                This password meets all security requirements. Share it securely with the administrator.
                              </p>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setResetAdmin(null)}>Cancel</Button>
                              <Button onClick={handleConfirmReset}>Confirm Reset</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </Can>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Helpers: convert between library Product type and AdminProduct form type ─

function productToAdminProduct(p: Product): AdminProduct {
  const specsArray = Object.entries(p.specs).map(([key, value]) => ({ key, value }));
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    powerRating: p.powerRating,
    description: p.shortDescription,
    image: p.image,
    performance: p.performance ?? [],
    features: p.features,
    safety: p.safety ?? [],
    idealFor: p.idealFor,
    specifications: specsArray,
    warranty: p.warranty ?? '',
    installation: p.installation ?? '',
  };
}

function adminProductToProduct(ap: AdminProduct, existingProduct?: Product): Product {
  const specs: Record<string, string> = {};
  ap.specifications.forEach(s => { if (s.key.trim()) specs[s.key.trim()] = s.value; });
  return {
    id: ap.id || Math.random().toString(36).substr(2, 9),
    slug: existingProduct?.slug ?? ap.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    name: ap.name,
    category: ap.category,
    powerRating: ap.powerRating,
    shortDescription: ap.description,
    fullDescription: existingProduct?.fullDescription ?? '',
    performance: ap.performance,
    features: ap.features,
    safety: ap.safety,
    specs,
    idealFor: ap.idealFor,
    image: ap.image,
    warranty: ap.warranty || undefined,
    installation: ap.installation || undefined,
  };
}

// ── ProductSection ───────────────────────────────────────────────────────────

function ProductSection({ products, setProducts, mockRole }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>>, mockRole: Role }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openAddDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleCancel = () => setIsDialogOpen(false);

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Product Deleted', description: 'The product has been removed from the catalog.' });
  };

  const handleSave = (adminProduct: AdminProduct) => {
    if (editingProduct) {
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? adminProductToProduct(adminProduct, editingProduct)
            : p
        )
      );
      toast({ title: 'Product Updated', description: `"${adminProduct.name}" has been updated successfully.` });
    } else {
      const newProduct = adminProductToProduct(adminProduct);
      setProducts(prev => [...prev, newProduct]);
      toast({ title: 'Product Added', description: `"${adminProduct.name}" has been added to the catalog.` });
    }
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Product Catalog</CardTitle>
          <CardDescription>Create and manage your full product listings.</CardDescription>
        </div>
        <Can role={mockRole} perform="manage_products">
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" /> Add Product
          </Button>
        </Can>
      </CardHeader>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCancel(); }}>
        <DialogContent className="max-w-2xl bg-card max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-lg font-bold">
              {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update all product details — changes are saved immediately to the catalog.'
                : 'Fill in all sections to create a complete product listing.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ProductForm
              key={editingProduct?.id ?? 'new'}
              initialData={editingProduct ? productToAdminProduct(editingProduct) : undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Product Table ── */}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Power Rating</TableHead>
              <Can role={mockRole} perform="manage_products">
                <TableHead className="text-right">Actions</TableHead>
              </Can>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-12 w-16 rounded-md overflow-hidden bg-muted flex items-center justify-center border">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="text-muted-foreground/50" size={16} />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{product.category}</TableCell>
                <TableCell className="text-muted-foreground">{product.powerRating}</TableCell>
                <Can role={mockRole} perform="manage_products">
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => openEditDialog(product)}>
                        <Edit size={16} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:text-destructive"><Trash2 size={16} /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove &quot;{product.name}&quot; from the catalog. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </Can>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function WarrantyManagementSection({ warranties, setWarranties, products, mockRole }: { warranties: WarrantyEntry[], setWarranties: (w: WarrantyEntry[]) => void, products: Product[], mockRole: Role }) {
  const { toast } = useToast();
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWarranties = useMemo(() => {
    return warranties.filter((w) =>
      w.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [warranties, searchTerm]);

  const getStatusBadge = (status: WarrantyStatus) => {
    switch (status) {
      case 'Active': return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case 'Expired': return <Badge variant="secondary">Expired</Badge>;
      case 'Claim Requested': return <Badge className="bg-orange-500 hover:bg-orange-600">Claim Requested</Badge>;
      case 'Claim Approved': return <Badge className="bg-blue-600 hover:bg-blue-700">Claim Approved</Badge>;
      case 'Claim Rejected': return <Badge variant="destructive">Claim Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Warranty Registry</CardTitle>
          <CardDescription>View product serials and customer claims. (Read-Only)</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by Serial No (e.g. RV-1K-001)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[280px] pl-9"
            />
          </div>
          {searchTerm && (
            <Button variant="ghost" onClick={() => setSearchTerm("")} className="px-3">
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWarranties.length > 0 ? (
              filteredWarranties.map((w) => (
                <TableRow key={w.id} className={w.status === 'Claim Requested' ? 'bg-orange-500/5' : ''}>
                  <TableCell className="font-mono font-bold text-primary">{w.serialNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{w.customerName}</span>
                      <span className="text-xs text-muted-foreground">{w.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{w.productName}</TableCell>
                  <TableCell>{getStatusBadge(w.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedWarranty(w)}><Eye size={16} /></Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card">
                          <DialogHeader>
                            <DialogTitle>Warranty Details</DialogTitle>
                            <DialogDescription>Full record for Serial: {selectedWarranty?.serialNumber}</DialogDescription>
                          </DialogHeader>
                          {selectedWarranty && (
                            <div className="space-y-6 py-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs text-muted-foreground uppercase">Customer</Label>
                                  <p className="font-bold">{selectedWarranty.customerName}</p>
                                  <p>{selectedWarranty.phone}</p>
                                  <p className="text-xs">{selectedWarranty.email}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground uppercase">Dates</Label>
                                  <p>Purchased: {selectedWarranty.purchaseDate}</p>
                                  <p className="font-bold text-primary">Expires: {selectedWarranty.expiryDate}</p>
                                </div>
                              </div>

                              {selectedWarranty.claimMessage && (
                                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 space-y-2">
                                  <Label className="text-xs text-orange-500 font-bold uppercase flex items-center gap-2">
                                    <AlertTriangle size={14} /> Claim Issue Description
                                  </Label>
                                  <p className="text-sm italic">"{selectedWarranty.claimMessage}"</p>
                                </div>
                              )}
                              
                              <div className="p-4 rounded-lg bg-muted border flex items-center gap-3">
                                <ShieldCheck size={24} className="text-primary" />
                                <div>
                                  <p className="font-bold text-sm">Current Status</p>
                                  <div className="mt-1">{getStatusBadge(selectedWarranty.status)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No warranty records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CareerManagementSection({ jobs, setJobs, mockRole }: { jobs: Job[], setJobs: (jobs: Job[]) => void, mockRole: Role }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    location: '',
    type: 'Full-time',
    description: ''
  });

  const openAddDialog = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      location: '',
      type: 'Full-time',
      description: ''
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setFormData({ ...job });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const newJobs = jobs.filter(j => j.id !== id);
    setJobs(newJobs);
    toast({ title: "Job Deleted", description: "The job listing has been removed." });
  };

  const handleSaveJob = () => {
    if (!formData.title || !formData.location) return;

    if (editingJob) {
      const newJobs = jobs.map(j => j.id === editingJob.id ? { ...editingJob, ...formData } as Job : j);
      setJobs(newJobs);
      toast({ title: "Job Updated", description: `${formData.title} listing has been updated.` });
    } else {
      const newJob: Job = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title || '',
        location: formData.location || '',
        type: (formData.type as JobType) || 'Full-time',
        description: formData.description || '',
        postedAt: new Date().toISOString().split('T')[0]
      };
      setJobs([...jobs, newJob]);
      toast({ title: "Job Added", description: `${newJob.title} is now active on the careers page.` });
    }
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Job Listings</CardTitle>
          <CardDescription>Manage open positions for REVOPZ.</CardDescription>
        </div>
        <Can role={mockRole} perform="manage_careers">
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" /> Add Job
          </Button>
        </Can>
      </CardHeader>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'Add New Job'}</DialogTitle>
            <DialogDescription>Enter the job details for prospective candidates.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Sales Manager" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Palakkad, Kerala" />
            </div>
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief overview of the role..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveJob}>{editingJob ? 'Update Job' : 'Save Job'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <Can role={mockRole} perform="manage_careers"><TableHead className="text-right">Actions</TableHead></Can>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell className="text-muted-foreground">{job.location}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{job.type}</Badge>
                </TableCell>
                <Can role={mockRole} perform="manage_careers">
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(job)}>
                        <Edit size={16} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:text-destructive"><Trash2 size={16} /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{job.title}" position?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(job.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </Can>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ApplicationsSection({ applications, setApplications, mockRole }: { applications: JobApplication[], setApplications: (apps: JobApplication[]) => void, mockRole: Role }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    const updated = applications.map(app => app.id === id ? { ...app, status: newStatus } : app);
    setApplications(updated);
    toast({ title: "Status Updated", description: `Application status changed to ${newStatus}.` });
  };

  const handleDelete = (id: string) => {
    const updated = applications.filter(app => app.id !== id);
    setApplications(updated);
    toast({ title: "Application Deleted", description: "The application has been removed." });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'New': return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case 'Under Review': return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Under Review</Badge>;
      case 'Shortlisted': return <Badge className="bg-green-500 hover:bg-green-600">Shortlisted</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Applications Overview</CardTitle>
          <CardDescription>Track and manage candidate submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search by name or job..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps.length > 0 ? filteredApps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{app.applicantName}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{app.jobTitle}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{app.submittedAt}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedApp(app)}><Eye size={16} /></Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-headline">Application Detail</DialogTitle>
                            <DialogDescription>Review candidate information and update hiring status.</DialogDescription>
                          </DialogHeader>
                          {selectedApp && (
                            <div className="space-y-6 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-xs text-muted-foreground uppercase font-bold">Applicant</Label>
                                  <p className="text-lg font-bold">{selectedApp.applicantName}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground uppercase font-bold">Role Applied For</Label>
                                  <p className="text-lg font-bold text-primary">{selectedApp.jobTitle}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground uppercase font-bold">Email</Label>
                                  <p className="text-sm">{selectedApp.email}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground uppercase font-bold">Phone</Label>
                                  <p className="text-sm">{selectedApp.phone}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground uppercase font-bold">Message / Cover Letter</Label>
                                <div className="p-4 rounded-lg bg-muted/50 text-sm italic leading-relaxed whitespace-pre-wrap">
                                  "{selectedApp.message}"
                                </div>
                              </div>
                              <Can role={mockRole} perform="manage_careers">
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground uppercase font-bold">Hiring Status</Label>
                                  <Select
                                    defaultValue={selectedApp.status}
                                    onValueChange={(v: ApplicationStatus) => handleUpdateStatus(selectedApp.id, v)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                      <SelectItem value="New">New</SelectItem>
                                      <SelectItem value="Under Review">Under Review</SelectItem>
                                      <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                                      <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </Can>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Can role={mockRole} perform="manage_careers">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:text-destructive"><Trash2 size={16} /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Application?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove the application from {app.applicantName}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(app.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No applications found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
// ── ManufacturedUnitsSection ─────────────────────────────────────────────────

interface MockCatalogProduct {
  id: string;
  name: string;
  category: string;
  warrantyMonths: number;
}

interface ManufacturedUnit {
  id: string;
  productId: string;
  productName: string;
  productNumber: string;
  category: string;
  manufacturingDate: string;
  warrantyMonths: number;
  status: 'Ready' | 'Registered';
}

const MOCK_CATALOG: MockCatalogProduct[] = [
  { id: 'p1', name: 'RZ 1100+', category: 'Inverter', warrantyMonths: 60 },
  { id: 'p2', name: 'RZ 1350+', category: 'Inverter', warrantyMonths: 60 },
  { id: 'p3', name: 'RZ 1550+', category: 'Inverter', warrantyMonths: 60 },
  { id: 'p4', name: 'RZ 200Ah Battery', category: 'Battery', warrantyMonths: 60 },
  { id: 'p5', name: 'RZ 150Ah Battery', category: 'Battery', warrantyMonths: 60 },
];

const TODAY_ISO = new Date().toISOString().split('T')[0];

function ManufacturedUnitsSection({ mockRole }: { mockRole: Role }) {
  const { toast } = useToast();
  const [units, setUnits] = useState<ManufacturedUnit[]>([
    {
      id: 'u1',
      productId: 'p2',
      productName: 'RZ 1350+',
      productNumber: 'RZ1350-001',
      category: 'Inverter',
      manufacturingDate: '2026-04-01',
      warrantyMonths: 60,
      status: 'Ready',
    },
    {
      id: 'u2',
      productId: 'p4',
      productName: 'RZ 200Ah Battery',
      productNumber: 'RZ200AH-001',
      category: 'Battery',
      manufacturingDate: '2026-03-15',
      warrantyMonths: 60,
      status: 'Registered',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const emptyForm = {
    productId: '',
    productName: '',
    productNumber: '',
    category: '',
    warrantyMonths: 60,
  };
  const [form, setForm] = useState(emptyForm);

  const openAddDialog = () => {
    setForm(emptyForm);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleProductChange = (productId: string) => {
    const selected = MOCK_CATALOG.find(p => p.id === productId);
    if (!selected) return;
    setForm(f => ({
      ...f,
      productId,
      productName: selected.name,
      category: selected.category,
      warrantyMonths: selected.warrantyMonths,
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.productId) errs.productId = 'Please select a product.';
    if (!form.productNumber.trim()) errs.productNumber = 'Product number is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newUnit: ManufacturedUnit = {
      id: Math.random().toString(36).substr(2, 9),
      productId: form.productId,
      productName: form.productName,
      productNumber: form.productNumber.trim().toUpperCase(),
      category: form.category,
      manufacturingDate: TODAY_ISO,
      warrantyMonths: form.warrantyMonths,
      status: 'Ready',
    };
    setUnits(prev => [newUnit, ...prev]);
    setIsDialogOpen(false);
    toast({ title: '✅ Unit Added', description: `${newUnit.productName} (${newUnit.productNumber}) added successfully.` });
  };

  const handleDelete = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
    toast({ title: 'Unit Removed', description: 'The manufactured unit has been deleted.' });
  };

  const filtered = units.filter(u =>
    u.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateDisplay = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Factory size={20} className="text-primary" /> Manufactured Units
          </CardTitle>
          <CardDescription>Manage manufactured products and track warranty-ready units.</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by product number…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 w-56"
            />
          </div>
          <Can role={mockRole} perform="manage_units">
            <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90 shrink-0">
              <Plus size={16} className="mr-2" /> Add Unit
            </Button>
          </Can>
        </div>
      </CardHeader>

      {/* ── Add Unit Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={open => { if (!open) setIsDialogOpen(false); }}>
        <DialogContent className="bg-card max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline flex items-center gap-2">
              <Factory size={20} className="text-primary" /> Add Manufactured Unit
            </DialogTitle>
            <DialogDescription>
              Select a product to auto-fill category and warranty. Manufacturing date is locked to today.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Product Select */}
            <div className="space-y-1">
              <Label htmlFor="unit-product">Product *</Label>
              <Select value={form.productId} onValueChange={handleProductChange}>
                <SelectTrigger id="unit-product" className={formErrors.productId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a product…" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {MOCK_CATALOG.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.productId && <p className="text-xs text-destructive">{formErrors.productId}</p>}
            </div>

            {/* Product Number */}
            <div className="space-y-1">
              <Label htmlFor="unit-number">Product Number *</Label>
              <Input
                id="unit-number"
                autoFocus
                placeholder="e.g. RZ1350-010"
                className={`font-mono uppercase ${formErrors.productNumber ? 'border-destructive' : ''}`}
                value={form.productNumber}
                onChange={e => setForm(f => ({ ...f, productNumber: e.target.value }))}
              />
              {formErrors.productNumber && <p className="text-xs text-destructive">{formErrors.productNumber}</p>}
            </div>

            {/* Category — auto-filled, disabled */}
            <div className="space-y-1">
              <Label>Category</Label>
              <Input
                value={form.category || '—'}
                disabled
                className="bg-muted/40 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground/70">Auto-filled from selected product.</p>
            </div>

            {/* Warranty Months — auto-filled, editable */}
            <div className="space-y-1">
              <Label htmlFor="unit-warranty">Warranty (Months)</Label>
              <Input
                id="unit-warranty"
                type="number"
                min={1}
                value={form.warrantyMonths}
                onChange={e => setForm(f => ({ ...f, warrantyMonths: Number(e.target.value) }))}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground/70">Auto-filled; you may adjust if needed.</p>
            </div>

            {/* Manufacturing Date — locked to today */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <CalendarDays size={13} /> Manufacturing Date
                <Lock size={11} className="ml-0.5 text-muted-foreground opacity-70" />
              </Label>
              <Input
                value={formatDateDisplay(TODAY_ISO)}
                readOnly
                tabIndex={-1}
                className="bg-muted/40 text-muted-foreground cursor-not-allowed border-border/40 font-medium"
              />
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <Lock size={10} /> Automatically set to today's date.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4 flex gap-3 sticky bottom-0 bg-card pb-1">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X size={16} className="mr-2" /> Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.productId || !form.productNumber.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Factory size={16} className="mr-2" /> Add Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Table ── */}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Product Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Mfg. Date</TableHead>
              <TableHead>Warranty (Mo.)</TableHead>
              <TableHead>Status</TableHead>
              <Can role={mockRole} perform="manage_units"><TableHead className="text-right">Actions</TableHead></Can>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? filtered.map(unit => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.productName}</TableCell>
                <TableCell className="font-mono text-primary font-bold">{unit.productNumber}</TableCell>
                <TableCell className="text-muted-foreground capitalize">{unit.category}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDateDisplay(unit.manufacturingDate)}</TableCell>
                <TableCell className="text-center">{unit.warrantyMonths}</TableCell>
                <TableCell>
                  {unit.status === 'Ready'
                    ? <Badge className="bg-blue-600 hover:bg-blue-700">Ready</Badge>
                    : <Badge className="bg-green-600 hover:bg-green-700">Registered</Badge>}
                </TableCell>
                <Can role={mockRole} perform="manage_units">
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Unit?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove <span className="font-mono font-bold">{unit.productNumber}</span> from the manufactured units list. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(unit.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </Can>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {searchTerm
                    ? `No units found matching "${searchTerm}".`
                    : 'No manufactured units yet. Click "+ Add Unit" to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
