"use client";

import { useState, useEffect, useRef } from 'react';
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
  ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { PRODUCTS as initialProducts, Product } from '@/lib/products';
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

type WarrantyEntry = {
  id: string;
  productName: string;
  serialNumber: string;
  customerName: string;
  purchaseDate: string;
  warrantyPeriod: string;
  status: 'Active' | 'Claimed';
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
  const [warranties, setWarranties] = useState<WarrantyEntry[]>([
    { 
      id: 'w1', 
      productName: 'Lithium Inverter 1kVA', 
      serialNumber: 'RV-1K-001', 
      customerName: 'Suresh Kumar', 
      purchaseDate: '2023-10-15', 
      warrantyPeriod: '24 Months', 
      status: 'Active' 
    },
    { 
      id: 'w2', 
      productName: 'Lithium Battery 12V', 
      serialNumber: 'RV-B12-552', 
      customerName: 'Anjali Menon', 
      purchaseDate: '2023-05-20', 
      warrantyPeriod: '60 Months', 
      status: 'Claimed' 
    }
  ]);

  // Auth check
  useEffect(() => {
    const auth = localStorage.getItem('revopz_admin_auth');
    if (auth === 'true') setIsLoggedIn(true);
  }, []);

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
                 activeTab === 'products' ? 'Product Catalog' : 'Warranty Registry'}
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
            {activeTab === 'warranty' && <WarrantySection products={products} warranties={warranties} setWarranties={setWarranties} />}
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

function WarrantySection({ products, warranties, setWarranties }: { products: Product[], warranties: WarrantyEntry[], setWarranties: React.Dispatch<React.SetStateAction<WarrantyEntry[]>> }) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<WarrantyEntry>>({
    productName: '',
    serialNumber: '',
    customerName: '',
    purchaseDate: '',
    warrantyPeriod: '24 Months'
  });

  useEffect(() => {
    setNewEntry(prev => ({
      ...prev,
      purchaseDate: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handleAddWarranty = () => {
    if (!newEntry.serialNumber || !newEntry.customerName) return;
    const entry: WarrantyEntry = {
      id: Math.random().toString(36).substr(2, 9),
      productName: newEntry.productName || 'General Product',
      serialNumber: newEntry.serialNumber || '',
      customerName: newEntry.customerName || '',
      purchaseDate: newEntry.purchaseDate || '',
      warrantyPeriod: newEntry.warrantyPeriod || '24 Months',
      status: 'Active'
    };
    setWarranties([entry, ...warranties]);
    setIsAddOpen(false);
    toast({ title: "Warranty Registered", description: `Serial ${entry.serialNumber} is now active.` });
  };

  const toggleStatus = (id: string) => {
    setWarranties(warranties.map(w => {
      if (w.id === id) {
        const newStatus = w.status === 'Active' ? 'Claimed' : 'Active';
        toast({ title: "Status Updated", description: `Warranty is now ${newStatus}.` });
        return { ...w, status: newStatus as any };
      }
      return w;
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Warranty Registry</CardTitle>
          <CardDescription>Track claims and registered serial numbers.</CardDescription>
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
              <div className="space-y-2">
                <Label>Product</Label>
                <Select onValueChange={(v) => setNewEntry({...newEntry, productName: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {products.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input value={newEntry.serialNumber} onChange={(e) => setNewEntry({...newEntry, serialNumber: e.target.value})} placeholder="e.g. RV-2024-X99" />
              </div>
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={newEntry.customerName} onChange={(e) => setNewEntry({...newEntry, customerName: e.target.value})} placeholder="Enter customer name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" value={newEntry.purchaseDate} onChange={(e) => setNewEntry({...newEntry, purchaseDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Warranty Period</Label>
                  <Select value={newEntry.warrantyPeriod} onValueChange={(v) => setNewEntry({...newEntry, warrantyPeriod: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="12 Months">12 Months</SelectItem>
                      <SelectItem value="24 Months">24 Months</SelectItem>
                      <SelectItem value="36 Months">36 Months</SelectItem>
                      <SelectItem value="60 Months">60 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warranties.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-mono font-bold text-primary">{w.serialNumber}</TableCell>
                <TableCell>{w.customerName}</TableCell>
                <TableCell className="text-muted-foreground">{w.productName}</TableCell>
                <TableCell>
                  <Badge variant={w.status === 'Active' ? 'default' : 'destructive'} className={w.status === 'Active' ? 'bg-green-600' : ''}>
                    {w.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => toggleStatus(w.id)}>
                    {w.status === 'Active' ? 'Mark Claimed' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
