"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  UserCircle,
  Users,
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
import { Role, Can, hasPermission, toDisplayRole, getEffectivePermissions } from '@/lib/rbac';
import { AdminProfile, getInitials } from '@/lib/adminService';
import {
  appUserEmailExists,
  createAppUser,
  type AppUser,
  type AppUserStatus,
} from '@/lib/appUsers';
import { useAppUsers } from '@/hooks/useAppUsers';
import {
  addManufacturedUnit,
  manufacturedUnitNumberExists,
  type ManufacturedUnit,
  type ManufacturedUnitCategory,
} from '@/lib/manufacturedUnits';
import { useManufacturedUnits } from '@/hooks/useManufacturedUnits';
import { generateSecurePassword } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  addAdminSchema,
  addAppUserSchema,
  addManufacturedUnitSchema,
  normalizeProductNumber,
  type LoginFormData,
  type AddAdminFormData,
  type AddAppUserFormData,
  type AddManufacturedUnitFormData,
  checkPasswordStrength,
} from '@/lib/validations';

// Types
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export default function AdminPage() {
  const { toast } = useToast();
  const { user, adminProfile, loading: authLoading, accessDenied, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  // Login State
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  // Data State
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [warranties, setWarranties] = useState<WarrantyEntry[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Initialize and Sync Data
  useEffect(() => {
    const savedJobs = localStorage.getItem('revopz_jobs');
    if (savedJobs) { setJobs(JSON.parse(savedJobs)); } else { setJobs(INITIAL_JOBS); localStorage.setItem('revopz_jobs', JSON.stringify(INITIAL_JOBS)); }

    const savedApps = localStorage.getItem('revopz_applications');
    if (savedApps) { setApplications(JSON.parse(savedApps)); } else { setApplications(INITIAL_APPLICATIONS); localStorage.setItem('revopz_applications', JSON.stringify(INITIAL_APPLICATIONS)); }

    const savedWarranties = localStorage.getItem('revopz_warranties');
    if (savedWarranties) { setWarranties(JSON.parse(savedWarranties)); } else { setWarranties(INITIAL_WARRANTIES); localStorage.setItem('revopz_warranties', JSON.stringify(INITIAL_WARRANTIES)); }
  }, []);

  // Seed local admin list from Firestore profile once loaded
  useEffect(() => {
    if (adminProfile) {
      setAdmins([{ id: adminProfile.uid, name: adminProfile.name, email: adminProfile.email, role: toDisplayRole(adminProfile.role) }]);
    }
  }, [adminProfile]);

  const handleUpdateJobs = (newJobs: Job[]) => { setJobs(newJobs); localStorage.setItem('revopz_jobs', JSON.stringify(newJobs)); };
  const handleUpdateApps = (newApps: JobApplication[]) => { setApplications(newApps); localStorage.setItem('revopz_applications', JSON.stringify(newApps)); };
  const handleUpdateWarranties = (newWarranties: WarrantyEntry[]) => { setWarranties(newWarranties); localStorage.setItem('revopz_warranties', JSON.stringify(newWarranties)); };

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setIsLoggingIn(true);
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log(`[Auth] Login successful for: ${userCredential.user.email}`);
      // AuthContext will fetch adminProfile from Firestore automatically via onAuthStateChanged
    } catch (error: any) {
      console.warn('[Auth] Sign-in failed. Code:', error.code);
      const messages: Record<string, { title: string; description: string }> = {
        'auth/user-not-found': { title: 'Access Denied', description: "You don't have admin access." },
        'auth/wrong-password': { title: 'Incorrect Password', description: 'Incorrect password. Please contact the super admin.' },
        'auth/invalid-credential': { title: 'Login Failed', description: 'Invalid credentials. Please check your email and password.' },
        'auth/invalid-email': { title: 'Invalid Email', description: 'The email address format is not valid.' },
        'auth/too-many-requests': { title: 'Account Temporarily Locked', description: 'Too many failed attempts. Please try again later.' },
        'auth/network-request-failed': { title: 'Network Error', description: 'Check your internet connection and try again.' },
      };
      const msg = messages[error.code] ?? { title: 'Error', description: 'Something went wrong. Please try again later.' };
      toast({ ...msg, variant: 'destructive' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Logged Out', description: 'You have been logged out of the admin panel.' });
  };

  // ── Auth loading screen ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
          <LayoutDashboard className="text-primary" />
        </div>
        <div className="space-y-2 text-center">
          <div className="h-3 w-32 bg-muted rounded-full animate-pulse mx-auto" />
          <div className="h-2 w-24 bg-muted/50 rounded-full animate-pulse mx-auto" />
        </div>
        <Loader2 className="h-6 w-6 text-primary animate-spin mt-2" />
      </div>
    );
  }

  // ── Access denied screen (valid Firebase user but no Firestore admin doc) ─
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/30 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4 border border-destructive/20">
              <ShieldCheck className="text-destructive" size={28} />
            </div>
            <CardTitle className="text-xl font-headline text-destructive">Access Denied</CardTitle>
            <CardDescription>
              Your account is not registered as an admin or has been deactivated. Contact your system administrator.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full border-destructive/30 hover:bg-destructive/10" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ── Login screen ─────────────────────────────────────────────────────────
  if (!user || !adminProfile) {
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
                {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</> : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // ── Live data from Firestore ───────────────────────────────────────────────
  const permissions = getEffectivePermissions(adminProfile);
  const displayRole = toDisplayRole(adminProfile.role);
  const initials = getInitials(adminProfile.name);

  // Auto-redirect Production Unit to the only permitted tab
  const isProductionUnit = displayRole === 'Production Unit';
  const resolvedTab = isProductionUnit ? 'units' : (activeTab === 'profile' && !hasPermission(permissions, 'manage_admins') ? 'units' : activeTab);

  // ── Dashboard ─────────────────────────────────────────────────────────────
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
          <Can permissions={permissions} perform="manage_admins">
            <SidebarButton active={resolvedTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserCircle size={20} />} label="Admin Profile" />
          </Can>
          <Can permissions={permissions} perform="manage_products">
            <SidebarButton active={resolvedTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={20} />} label="Product Mgmt" />
          </Can>
          <Can permissions={permissions} perform="manage_users">
            <SidebarButton active={resolvedTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={20} />} label="User Mgmt" />
          </Can>
          <Can permissions={permissions} perform="manage_units">
            <SidebarButton active={resolvedTab === 'units'} onClick={() => setActiveTab('units')} icon={<Factory size={20} />} label="Manufactured Units" />
          </Can>
          <Can permissions={permissions} perform="view_warranty">
            <SidebarButton active={resolvedTab === 'warranty'} onClick={() => setActiveTab('warranty')} icon={<ShieldCheck size={20} />} label="Warranty Mgmt" />
          </Can>
          <Can permissions={permissions} perform="manage_careers">
            <SidebarButton active={resolvedTab === 'careers'} onClick={() => setActiveTab('careers')} icon={<Briefcase size={20} />} label="Career Mgmt" />
            <SidebarButton active={resolvedTab === 'applications'} onClick={() => setActiveTab('applications')} icon={<FileText size={20} />} label="Applications" />
          </Can>
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut size={20} className="mr-3" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline capitalize">
                {resolvedTab === 'profile' ? 'Profile Management' :
                  resolvedTab === 'products' ? 'Product Catalog' :
                    resolvedTab === 'users' ? 'User Management' :
                    resolvedTab === 'units' ? 'Manufactured Units' :
                      resolvedTab === 'warranty' ? 'Warranty Registry' :
                        resolvedTab === 'careers' ? 'Career Management' : 'Job Applications'}
              </h1>
              <p className="text-muted-foreground">
                {resolvedTab === 'units' ? 'Manage manufactured products and track warranty-ready units.' :
                  resolvedTab === 'users' ? 'Create and manage mobile application users.' :
                    'Manage your REVOPZ system operations and data.'}
              </p>
            </div>

            {/* Live admin profile badge (top-right) */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="font-bold text-sm">{adminProfile.name}</span>
                <span className="text-xs text-primary font-medium">{displayRole}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold select-none">
                {initials}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {resolvedTab === 'profile' && <ProfileSection admins={admins} setAdmins={setAdmins} permissions={permissions} adminProfile={adminProfile} />}
            {resolvedTab === 'products' && <ProductSection products={products} setProducts={setProducts} permissions={permissions} />}
            {resolvedTab === 'users' && <UserManagementSection permissions={permissions} adminProfile={adminProfile} />}
            {resolvedTab === 'units' && <ManufacturedUnitsSection permissions={permissions} adminProfile={adminProfile} />}
            {resolvedTab === 'warranty' && <WarrantyManagementSection warranties={warranties} setWarranties={handleUpdateWarranties} products={products} permissions={permissions} />}
            {resolvedTab === 'careers' && <CareerManagementSection jobs={jobs} setJobs={handleUpdateJobs} permissions={permissions} />}
            {resolvedTab === 'applications' && <ApplicationsSection applications={applications} setApplications={handleUpdateApps} permissions={permissions} />}
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

function ProfileSection({ admins, setAdmins, permissions, adminProfile }: { admins: AdminUser[], setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>, permissions: string[], adminProfile: AdminProfile }) {
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
    switch (r) {
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
                {getInitials(adminProfile.name)}
              </div>
              <h3 className="font-bold text-xl">{adminProfile.name}</h3>
              <p className="text-muted-foreground text-sm">{adminProfile.email}</p>
              <div className="mt-2">{getRoleBadge(toDisplayRole(adminProfile.role))}</div>
            </div>
            <div className="pt-4 border-t border-primary/10 space-y-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">Permissions</p>
              <ul className="text-sm space-y-1">
                {hasPermission(permissions, 'manage_admins') && <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Manage Admins</li>}
                {hasPermission(permissions, 'manage_products') && <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Product Catalog</li>}
                {hasPermission(permissions, 'manage_units') && <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Production Units</li>}
                {hasPermission(permissions, 'view_warranty') && <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> View Warranties</li>}
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
            <Can permissions={permissions} perform="manage_admins">
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                if (!open) { reset(); setShowPassword(false); }
                setIsAddDialogOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90"><Plus size={16} className="mr-2" /> Add User</Button>
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
                              <span className={`text-xs font-semibold capitalize ${passwordStrength === 'strong' ? 'text-green-500' :
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
                  <Can permissions={permissions} perform="reset_passwords"><TableHead className="text-right">Actions</TableHead></Can>
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
                    <Can permissions={permissions} perform="reset_passwords">
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

function UserManagementSection({ permissions, adminProfile }: { permissions: string[], adminProfile: AdminProfile }) {
  const { toast } = useToast();
  const canManageUsers = hasPermission(permissions, 'manage_users') && adminProfile.role === 'manager';
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [passwordWasGenerated, setPasswordWasGenerated] = useState(false);
  const { filteredUsers, isLoadingUsers, error: usersError } = useAppUsers(searchTerm);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AddAppUserFormData>({
    resolver: zodResolver(addAppUserSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password', '');
  const watchedConfirmPassword = watch('confirmPassword', '');
  const passwordConditions = checkPasswordStrength(watchedPassword);
  const passwordMet = passwordConditions.filter(c => c.met).length;
  const passwordStrength = passwordMet === 5 ? 'strong' : passwordMet >= 3 ? 'medium' : 'weak';

  useEffect(() => {
    if (!usersError) return;

    console.error('[UserManagement] Firestore subscription failed:', usersError);
    toast({
      title: 'Unable to load users',
      description: 'Mobile app users could not be loaded. Please try again.',
      variant: 'destructive',
    });
  }, [toast, usersError]);

  const resetAddUserDialog = () => {
    reset();
    setShowPassword(false);
    setIsCheckingEmail(false);
    setPasswordWasGenerated(false);
  };

  const handleGeneratePassword = () => {
    const password = generateSecurePassword(12);

    setValue('password', password, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('confirmPassword', password, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setPasswordWasGenerated(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Password copied to clipboard.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy.', variant: 'destructive' });
    }
  };

  const roleBadge = (role: AppUser['role']) => {
    return <Badge className="bg-primary hover:bg-primary/90">{role === 'user' ? 'User' : role}</Badge>;
  };

  const statusBadge = (status: AppUserStatus) => {
    return <Badge className="bg-green-600 hover:bg-green-700">{status === 'active' ? 'Active' : status}</Badge>;
  };

  const formatCreatedAt = (createdAt: AppUser['createdAt']) => {
    if (!createdAt) return 'Pending';
    return createdAt.toDate().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const onAddUserSubmit = async (data: AddAppUserFormData) => {
    if (!canManageUsers) {
      toast({
        title: 'Permission denied',
        description: 'Only managers can create mobile app users.',
        variant: 'destructive',
      });
      return;
    }

    const normalizedEmail = data.email.trim().toLowerCase();

    setIsCheckingEmail(true);
    try {
      const exists = await appUserEmailExists(normalizedEmail);

      if (exists) {
        setError('email', {
          type: 'manual',
          message: 'Email already exists.',
        });
        toast({
          title: 'Email already exists.',
          variant: 'destructive',
        });
        return;
      }

      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Your admin session expired. Please sign in again.');
      }

      await createAppUser({ ...data, email: normalizedEmail }, idToken);

      toast({
        title: 'User Added',
        description: `${data.name.trim()} can now sign in to the mobile app.`,
      });
      if (passwordWasGenerated) {
        setGeneratedCredentials({
          email: normalizedEmail,
          password: data.password,
        });
      }
      setIsAddDialogOpen(false);
      resetAddUserDialog();
    } catch (error: any) {
      const message = error?.message ?? 'User could not be created. Please try again.';

      if (message.toLowerCase().includes('email')) {
        setError('email', { type: 'manual', message });
      }

      if (message.toLowerCase().includes('phone')) {
        setError('phone', { type: 'manual', message });
      }

      toast({
        title: message === 'Email already exists.' ? message : 'Add failed',
        description: message === 'Email already exists.' ? undefined : message,
        variant: 'destructive',
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const strengthBarClass = passwordStrength === 'strong'
    ? 'bg-green-500'
    : passwordStrength === 'medium'
      ? 'bg-yellow-500'
      : 'bg-destructive';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users size={20} className="text-primary" /> User Management
          </CardTitle>
          <CardDescription>Create and manage mobile application users.</CardDescription>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 w-56"
            />
          </div>
          {canManageUsers && (
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              if (!open) resetAddUserDialog();
              setIsAddDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shrink-0">
                  <Plus size={16} className="mr-2" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-headline flex items-center gap-2">
                    <Users size={20} className="text-primary" /> Add User
                  </DialogTitle>
                  <DialogDescription>Create credentials for a mobile application user.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onAddUserSubmit)} className="space-y-4 py-2" noValidate>
                  <div className="space-y-1">
                    <Label htmlFor="app-user-name">Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="app-user-name"
                      placeholder="e.g. John Smith"
                      {...register('name')}
                      className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.name && <p className="text-xs text-destructive flex items-center gap-1"><X size={11} />{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="app-user-email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="app-user-email"
                      type="email"
                      placeholder="user@example.com"
                      {...register('email', {
                        onChange: () => {
                          if (errors.email?.type === 'manual') clearErrors('email');
                        },
                      })}
                      className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.email && <p className="text-xs text-destructive flex items-center gap-1"><X size={11} />{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="app-user-phone">Phone Number <span className="text-destructive">*</span></Label>
                    <Input
                      id="app-user-phone"
                      placeholder="+919876543210"
                      {...register('phone')}
                      className={errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.phone && <p className="text-xs text-destructive flex items-center gap-1"><X size={11} />{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-user-password">Password <span className="text-destructive">*</span></Label>
                      <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleGeneratePassword}>
                        <RefreshCcw size={12} className="mr-1" /> Generate
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="app-user-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        {...register('password', {
                          onChange: () => setPasswordWasGenerated(false),
                        })}
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
                    {errors.password && <p className="text-xs text-destructive flex items-center gap-1"><X size={11} />{errors.password.message}</p>}

                    {watchedPassword.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${strengthBarClass}`}
                              style={{ width: `${(passwordMet / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold capitalize ${passwordStrength === 'strong' ? 'text-green-500' :
                            passwordStrength === 'medium' ? 'text-yellow-500' : 'text-destructive'
                          }`}>
                            {passwordStrength}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {passwordConditions.map(condition => (
                            <li key={condition.label} className={`flex items-center gap-1.5 text-xs ${condition.met ? 'text-green-500' : 'text-muted-foreground'}`}>
                              {condition.met ? <CheckCircle2 size={11} /> : <X size={11} />}
                              {condition.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="app-user-confirm-password">Confirm Password <span className="text-destructive">*</span></Label>
                    <Input
                      id="app-user-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      {...register('confirmPassword')}
                      className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.confirmPassword
                      ? <p className="text-xs text-destructive flex items-center gap-1"><X size={11} />{errors.confirmPassword.message}</p>
                      : watchedConfirmPassword && watchedConfirmPassword === watchedPassword
                        ? <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 size={11} />Passwords match</p>
                        : null}
                  </div>

                  <DialogFooter className="pt-4 gap-2 sticky bottom-0 bg-card pb-1">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting || isCheckingEmail}>
                      <X size={16} className="mr-2" /> Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isValid || isSubmitting || isCheckingEmail}
                      className="bg-primary hover:bg-primary/90 min-w-[130px]"
                    >
                      {isCheckingEmail
                        ? <><Loader2 size={14} className="mr-2 animate-spin" /> Checking...</>
                        : isSubmitting
                          ? <><Loader2 size={14} className="mr-2 animate-spin" /> Creating...</>
                          : <><Users size={16} className="mr-2" /> Create User</>}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <Dialog open={!!generatedCredentials} onOpenChange={(open) => { if (!open) setGeneratedCredentials(null); }}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline flex items-center gap-2">
              <Key size={20} className="text-primary" /> Generated Credentials
            </DialogTitle>
            <DialogDescription>Share these credentials with the user securely.</DialogDescription>
          </DialogHeader>
          {generatedCredentials && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Email</p>
                  <p className="font-mono text-sm break-all">{generatedCredentials.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Temporary Password</p>
                  <p className="font-mono text-sm break-all">{generatedCredentials.password}</p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setGeneratedCredentials(null)}>
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => copyToClipboard(`${generatedCredentials.email}\n${generatedCredentials.password}`)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Copy size={16} className="mr-2" /> Copy
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`user-skeleton-${index}`}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length > 0 ? filteredUsers.map(appUser => (
              <TableRow key={appUser.id}>
                <TableCell className="font-medium">{appUser.name}</TableCell>
                <TableCell className="text-muted-foreground">{appUser.email}</TableCell>
                <TableCell className="text-muted-foreground">{appUser.phone}</TableCell>
                <TableCell>{roleBadge(appUser.role)}</TableCell>
                <TableCell>{statusBadge(appUser.status)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatCreatedAt(appUser.createdAt)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {searchTerm
                    ? `No users found matching "${searchTerm}".`
                    : 'No mobile app users have been created yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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

function ProductSection({ products, setProducts, permissions }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>>, permissions: string[] }) {
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
        <Can permissions={permissions} perform="manage_products">
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
              <Can permissions={permissions} perform="manage_products">
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
                <Can permissions={permissions} perform="manage_products">
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

function WarrantyManagementSection({ warranties, setWarranties, products, permissions }: { warranties: WarrantyEntry[], setWarranties: (w: WarrantyEntry[]) => void, products: Product[], permissions: string[] }) {
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

function CareerManagementSection({ jobs, setJobs, permissions }: { jobs: Job[], setJobs: (jobs: Job[]) => void, permissions: string[] }) {
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
        <Can permissions={permissions} perform="manage_careers">
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
              <Can permissions={permissions} perform="manage_careers"><TableHead className="text-right">Actions</TableHead></Can>
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
                <Can permissions={permissions} perform="manage_careers">
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

function ApplicationsSection({ applications, setApplications, permissions }: { applications: JobApplication[], setApplications: (apps: JobApplication[]) => void, permissions: string[] }) {
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
                              <Can permissions={permissions} perform="manage_careers">
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

                      <Can permissions={permissions} perform="manage_careers">
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

const UNIT_CATEGORIES: ManufacturedUnitCategory[] = ['Inverter', 'Battery', 'Solar', 'Other'];

const getTodayInputDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function ManufacturedUnitsSection({ permissions, adminProfile }: { permissions: string[], adminProfile: AdminProfile }) {
  const { toast } = useToast();

  const canAdd    = hasPermission(permissions, 'add_units');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen]   = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const { filteredUnits, isLoadingUnits, error: unitsError } = useManufacturedUnits(searchTerm);
  const defaultUnitFormValues: AddManufacturedUnitFormData = {
    productName: '',
    productNumber: '',
    category: 'Inverter',
    manufacturedDate: getTodayInputDate(),
    warrantyMonths: 60,
    status: 'Ready',
  };

  const {
    register: registerUnit,
    handleSubmit: handleUnitSubmit,
    reset: resetUnitForm,
    watch: watchUnitForm,
    setValue: setUnitValue,
    setError: setUnitError,
    clearErrors: clearUnitErrors,
    formState: { errors: unitErrors, isSubmitting, isValid },
  } = useForm<AddManufacturedUnitFormData>({
    resolver: zodResolver(addManufacturedUnitSchema),
    mode: 'onChange',
    defaultValues: defaultUnitFormValues,
  });

  const watchedCategory = watchUnitForm('category');

  useEffect(() => {
    if (!unitsError) return;

    console.error('[ManufacturedUnits] Firestore subscription failed:', unitsError);
    toast({
      title: 'Unable to load units',
      description: 'Manufactured units could not be loaded. Please try again.',
      variant: 'destructive',
    });
  }, [toast, unitsError]);

  const openAddDialog = () => {
    resetUnitForm({ ...defaultUnitFormValues, manufacturedDate: getTodayInputDate() });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const onAddUnitSubmit = async (data: AddManufacturedUnitFormData) => {
    if (!canAdd) {
      toast({
        title: 'Permission denied',
        description: 'Your role cannot add manufactured units.',
        variant: 'destructive',
      });
      return;
    }

    const normalizedProductNumber = normalizeProductNumber(data.productNumber);

    setIsCheckingDuplicate(true);
    try {
      const exists = await manufacturedUnitNumberExists(normalizedProductNumber);

      if (exists) {
        setUnitError('productNumber', {
          type: 'manual',
          message: 'This product number already exists.',
        });
        toast({
          title: 'Product number already exists.',
          variant: 'destructive',
        });
        return;
      }

      const productNumber = await addManufacturedUnit({
        productName: data.productName,
        productNumber: normalizedProductNumber,
        category: data.category,
        manufacturedDate: data.manufacturedDate,
        warrantyMonths: data.warrantyMonths,
        status: data.status,
        createdBy: adminProfile.uid,
        createdByName: adminProfile.name,
        createdByRole: adminProfile.role,
      });

      setIsDialogOpen(false);
      resetUnitForm(defaultUnitFormValues);
      toast({
        title: 'Unit Added',
        description: `${data.productName.trim()} (${productNumber}) has been recorded.`,
      });
    } catch (error: any) {
      const message = error?.message ?? 'Manufactured unit could not be added. Please try again.';
      if (message.toLowerCase().includes('product number')) {
        setUnitError('productNumber', { type: 'manual', message });
      }
      toast({
        title: message === 'Product number already exists.' ? message : 'Add failed',
        description: message === 'Product number already exists.' ? undefined : message,
        variant: 'destructive',
      });
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return 'Not set';

    const date = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(date.getTime())) return iso;

    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statusBadge = (s: ManufacturedUnit['status']) => {
    if (s === 'Ready')      return <Badge className="bg-blue-600 hover:bg-blue-700">Ready</Badge>;
    if (s === 'Registered') return <Badge className="bg-green-600 hover:bg-green-700">Registered</Badge>;
    return                         <Badge className="bg-muted text-muted-foreground">{s}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Factory size={20} className="text-primary" /> Manufactured Units
          </CardTitle>
          <CardDescription>
            {canAdd
              ? 'Add and track manufactured products. New units are recorded with today\'s date.'
              : 'View and search manufactured products and warranty-ready units.'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by name or number…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 w-56"
            />
          </div>
          {canAdd && (
            <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90 shrink-0" disabled={isLoadingUnits}>
              <Plus size={16} className="mr-2" /> Add Unit
            </Button>
          )}
        </div>
      </CardHeader>

      {/* ── Add Unit Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={open => { if (!open) closeDialog(); }}>
        <DialogContent className="bg-card sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline flex items-center gap-2">
              <Factory size={20} className="text-primary" /> Add Unit
            </DialogTitle>
            <DialogDescription>
              Fill in the unit details and enter the product serial number.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUnitSubmit(onAddUnitSubmit)} className="space-y-4 py-2">

            {/* Product Name */}
            <div className="space-y-1">
              <Label htmlFor="unit-product-name">Product Name <span className="text-destructive">*</span></Label>
              <Input
                id="unit-product-name"
                placeholder="e.g. RZ 1350+"
                {...registerUnit('productName')}
                className={unitErrors.productName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {unitErrors.productName && (
                <p className="text-xs text-destructive flex items-center gap-1"><X size={11} />{unitErrors.productName.message}</p>
              )}
            </div>

            {/* Product Number */}
            <div className="space-y-1">
              <Label htmlFor="unit-number">Product Number (Serial Number) <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="unit-number"
                  placeholder="e.g. RZ1350-001"
                  {...registerUnit('productNumber', {
                    onChange: event => {
                      event.target.value = event.target.value.toUpperCase();
                      if (unitErrors.productNumber?.type === 'manual') {
                        clearUnitErrors('productNumber');
                      }
                    },
                  })}
                  className={`font-mono pr-10 ${unitErrors.productNumber ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {isCheckingDuplicate && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              {unitErrors.productNumber
                ? <p className="text-xs text-destructive flex items-center gap-1 mt-1"><X size={11} />{unitErrors.productNumber.message}</p>
                : <p className="text-xs text-muted-foreground/70 mt-1">Letters, numbers, and hyphens only.</p>
              }
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={watchedCategory} onValueChange={value => setUnitValue('category', value as ManufacturedUnitCategory, { shouldDirty: true, shouldValidate: true })}>
                <SelectTrigger className={unitErrors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select category…" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {UNIT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {unitErrors.category && (
                <p className="text-xs text-destructive flex items-center gap-1"><X size={11} />{unitErrors.category.message}</p>
              )}
            </div>

            {/* Manufactured Date */}
            <div className="space-y-1">
              <Label htmlFor="unit-date">
                Manufactured Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit-date"
                type="date"
                max={getTodayInputDate()}
                {...registerUnit('manufacturedDate')}
                className={unitErrors.manufacturedDate ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {unitErrors.manufacturedDate && (
                <p className="text-xs text-destructive flex items-center gap-1"><X size={11} />{unitErrors.manufacturedDate.message}</p>
              )}
            </div>

            {/* Warranty */}
            <div className="space-y-1">
              <Label htmlFor="unit-warranty">Warranty (Months) <span className="text-destructive">*</span></Label>
              <Input
                id="unit-warranty"
                type="number"
                min={1}
                step={1}
                {...registerUnit('warrantyMonths')}
                className={unitErrors.warrantyMonths ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {unitErrors.warrantyMonths && (
                <p className="text-xs text-destructive">{unitErrors.warrantyMonths.message}</p>
              )}
            </div>

            <DialogFooter className="pt-4 gap-2 sticky bottom-0 bg-card pb-1">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting || isCheckingDuplicate}
                className="bg-primary hover:bg-primary/90 min-w-[120px]"
              >
                {isCheckingDuplicate
                  ? <><Loader2 size={14} className="mr-2 animate-spin" /> Checking...</>
                  : isSubmitting
                    ? <><Loader2 size={14} className="mr-2 animate-spin" /> Saving...</>
                  : <><Factory size={16} className="mr-2" /> Add Unit</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Product No.</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Mfg. Date</TableHead>
              <TableHead className="text-center">Warranty (Mo.)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUnits ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`unit-skeleton-${index}`}>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                </TableRow>
              ))
            ) : filteredUnits.length > 0 ? filteredUnits.map(unit => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.productName}</TableCell>
                <TableCell className="font-mono text-primary font-bold">{unit.productNumber}</TableCell>
                <TableCell className="text-muted-foreground">{unit.category}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(unit.manufacturedDate)}</TableCell>
                <TableCell className="text-center">{unit.warrantyMonths}</TableCell>
                <TableCell>{statusBadge(unit.status)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {searchTerm
                    ? `No units found matching "${searchTerm}".`
                    : canAdd
                      ? 'No manufactured units yet. Click "Add Unit" to get started.'
                      : 'No manufactured units have been recorded yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
