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
  Upload,
  ImageIcon,
  Briefcase,
  FileText,
  Search,
  Eye,
  AlertTriangle
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

// Types
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'Main Admin' | 'Sub Admin';
};

export default function AdminPage() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Data State
  const [admins, setAdmins] = useState<AdminUser[]>([
    { id: '1', name: 'Amal Raj T P', email: 'amal@revopz.com', role: 'Main Admin' }
  ]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [warranties, setWarranties] = useState<WarrantyEntry[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Initialize and Sync Data
  useEffect(() => {
    const auth = localStorage.getItem('revopz_admin_auth');
    if (auth === 'true') setIsLoggedIn(true);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
      localStorage.setItem('revopz_admin_auth', 'true');
      toast({ title: "Login Successful", description: "Welcome to the REVOPZ Admin Panel." });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('revopz_admin_auth');
    toast({ title: "Logged Out", description: "You have been logged out of the admin panel." });
  };

  if (!isLoggedIn) {
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
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@revopz.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="bg-background"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Sign In
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
          <SidebarButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            icon={<UserCircle size={20} />}
            label="Admin Profile"
          />
          <SidebarButton 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')}
            icon={<Package size={20} />}
            label="Product Mgmt"
          />
          <SidebarButton 
            active={activeTab === 'warranty'} 
            onClick={() => setActiveTab('warranty')}
            icon={<ShieldCheck size={20} />}
            label="Warranty Mgmt"
          />
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
                 activeTab === 'warranty' ? 'Warranty Registry' : 
                 activeTab === 'careers' ? 'Career Management' : 'Job Applications'}
              </h1>
              <p className="text-muted-foreground">Manage your REVOPZ system operations and data.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="font-bold text-sm">Amal Raj T P</span>
                <span className="text-xs text-primary font-medium">Main Admin</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                AR
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {activeTab === 'profile' && <ProfileSection admins={admins} setAdmins={setAdmins} />}
            {activeTab === 'products' && <ProductSection products={products} setProducts={setProducts} />}
            {activeTab === 'warranty' && <WarrantyManagementSection warranties={warranties} setWarranties={handleUpdateWarranties} products={products} />}
            {activeTab === 'careers' && <CareerManagementSection jobs={jobs} setJobs={handleUpdateJobs} />}
            {activeTab === 'applications' && <ApplicationsSection applications={applications} setApplications={handleUpdateApps} />}
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProfileSection({ admins, setAdmins }: { admins: AdminUser[], setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>> }) {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Main Admin' | 'Sub Admin'>('Sub Admin');
  const { toast } = useToast();

  const handleAddAdmin = () => {
    if (!newName || !newEmail) return;
    const newAdmin: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      email: newEmail,
      role: newRole
    };
    setAdmins([...admins, newAdmin]);
    setNewName('');
    setNewEmail('');
    toast({ title: "Admin Added", description: `${newName} is now a ${newRole}.` });
  };

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
              <Badge className="mt-2 bg-primary">Main Admin</Badge>
            </div>
            <div className="pt-4 border-t border-primary/10 space-y-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">Permissions</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Full Access</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> User Management</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> System Config</li>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90"><Plus size={16} className="mr-2" /> Add Admin</Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add New Administrator</DialogTitle>
                  <DialogDescription>Assign system access to a new team member.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@revopz.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="Main Admin">Main Admin</SelectItem>
                        <SelectItem value="Sub Admin">Sub Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddAdmin}>Save Administrator</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin.role === 'Main Admin' ? 'default' : 'secondary'}>
                        {admin.role}
                      </Badge>
                    </TableCell>
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

function ProductSection({ products, setProducts }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'inverters',
    powerRating: '',
    shortDescription: '',
    fullDescription: '',
    image: '',
    features: [],
    specs: {},
    idealFor: []
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'inverters',
      powerRating: '',
      shortDescription: '',
      fullDescription: '',
      image: '',
      features: [],
      specs: {},
      idealFor: []
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({ title: "Product Deleted", description: "The product has been removed from the catalog." });
  };

  const handleSaveProduct = () => {
    if (!formData.name) return;

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...formData } as Product : p));
      toast({ title: "Product Updated", description: `${formData.name} has been updated.` });
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        slug: (formData.name || '').toLowerCase().replace(/\s+/g, '-'),
        name: formData.name || '',
        category: (formData.category as any) || 'inverters',
        powerRating: formData.powerRating || '',
        shortDescription: formData.shortDescription || '',
        fullDescription: formData.fullDescription || '',
        features: formData.features || [],
        specs: formData.specs || {},
        idealFor: formData.idealFor || [],
        image: formData.image || 'https://picsum.photos/seed/default/600/400'
      };
      setProducts([...products, newProduct]);
      toast({ title: "Product Added", description: `${newProduct.name} is now live.` });
    }
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Product Catalog</CardTitle>
          <CardDescription>Update descriptions, specifications, and availability.</CardDescription>
        </div>
        <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
          <Plus size={16} className="mr-2" /> Add Product
        </Button>
      </CardHeader>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>Fill in the details to list a new energy system.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Lithium Pro 5kVA" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="inverters">Lithium Inverters</SelectItem>
                  <SelectItem value="batteries">Lithium Batteries</SelectItem>
                  <SelectItem value="systems">All-in-One Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Power Rating</Label>
              <Input value={formData.powerRating} onChange={(e) => setFormData({...formData, powerRating: e.target.value})} placeholder="e.g. 5000VA / 4000W" />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Short Description</Label>
              <Textarea value={formData.shortDescription} onChange={(e) => setFormData({...formData, shortDescription: e.target.value})} placeholder="Brief hook for listing pages..." />
            </div>
            
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Product Image</Label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-dashed border-2 py-8 flex flex-col gap-2"
                  >
                    <Upload size={20} />
                    <span>Click to Upload Image</span>
                  </Button>
                </div>
                
                {formData.image && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-primary/20 bg-muted/20">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={removeImage}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct}>{editingProduct ? 'Update Product' : 'Save Product'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Power Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the product "{product.name}" from the system catalog.
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function WarrantyManagementSection({ warranties, setWarranties, products }: { warranties: WarrantyEntry[], setWarranties: (w: WarrantyEntry[]) => void, products: Product[] }) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyEntry | null>(null);
  
  const [formData, setFormData] = useState<Partial<WarrantyEntry>>({
    serialNumber: '',
    productName: '',
    customerName: '',
    phone: '',
    email: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Active'
  });

  const handleAddWarranty = () => {
    if (!formData.serialNumber || !formData.customerName) return;

    // Auto-calculate expiry (default 24 months)
    const purchaseDate = new Date(formData.purchaseDate || '');
    const expiryDate = new Date(purchaseDate);
    expiryDate.setFullYear(purchaseDate.getFullYear() + 2);

    const entry: WarrantyEntry = {
      id: Math.random().toString(36).substr(2, 9),
      serialNumber: formData.serialNumber!.toUpperCase(),
      productName: formData.productName || 'General Product',
      customerName: formData.customerName!,
      phone: formData.phone || '',
      email: formData.email || '',
      purchaseDate: formData.purchaseDate || '',
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: (formData.status as WarrantyStatus) || 'Active'
    };

    setWarranties([entry, ...warranties]);
    setIsAddOpen(false);
    setFormData({ purchaseDate: new Date().toISOString().split('T')[0] });
    toast({ title: "Warranty Registered", description: `Serial ${entry.serialNumber} is now active.` });
  };

  const handleUpdateStatus = (id: string, newStatus: WarrantyStatus) => {
    const updated = warranties.map(w => w.id === id ? { ...w, status: newStatus } : w);
    setWarranties(updated);
    toast({ title: "Status Updated", description: `Warranty status changed to ${newStatus}.` });
  };

  const handleDelete = (id: string) => {
    const updated = warranties.filter(w => w.id !== id);
    setWarranties(updated);
    toast({ title: "Warranty Deleted", description: "Record removed from registry." });
  };

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
          <CardDescription>Manage product serials and customer claims.</CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90"><Plus size={16} className="mr-2" /> Register Warranty</Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Register New Warranty</DialogTitle>
              <DialogDescription>Link a product serial to a customer.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} placeholder="RV-1K-001" className="uppercase" />
                </div>
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select onValueChange={(v) => setFormData({...formData, productName: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {products.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91..." />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddWarranty}>Confirm Registration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {warranties.map((w) => (
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

                            <div className="space-y-2">
                              <Label>Update Status</Label>
                              <Select defaultValue={selectedWarranty.status} onValueChange={(v: WarrantyStatus) => handleUpdateStatus(selectedWarranty.id, v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-popover">
                                  <SelectItem value="Active">Active</SelectItem>
                                  <SelectItem value="Claim Requested">Claim Requested</SelectItem>
                                  <SelectItem value="Claim Approved">Claim Approved</SelectItem>
                                  <SelectItem value="Claim Rejected">Claim Rejected</SelectItem>
                                  <SelectItem value="Expired">Expired</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-destructive"><Trash2 size={16} /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Warranty?</AlertDialogTitle>
                          <AlertDialogDescription>Remove serial {w.serialNumber} from the registry.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(w.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CareerManagementSection({ jobs, setJobs }: { jobs: Job[], setJobs: (jobs: Job[]) => void }) {
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
        <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
          <Plus size={16} className="mr-2" /> Add Job
        </Button>
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
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Sales Manager" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Palakkad, Kerala" />
            </div>
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
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
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief overview of the role..." />
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
              <TableHead className="text-right">Actions</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ApplicationsSection({ applications, setApplications }: { applications: JobApplication[], setApplications: (apps: JobApplication[]) => void }) {
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
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

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

function SidebarButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
