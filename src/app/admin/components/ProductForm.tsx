"use client";

import { useState, useCallback } from 'react';
import {
  AlertTriangle, Zap, Tag, ImageIcon, Star, Shield,
  Activity, Target, Settings2, Info, Wrench
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DynamicListInput } from './DynamicListInput';
import { SpecInput, Spec } from './SpecInput';
import { ImageUploader } from './ImageUploader';
import type { AdminProduct } from '../types';

// ── Validation ──────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<'name' | 'category' | 'powerRating' | 'description', string>>;

function validate(data: Partial<AdminProduct>): FormErrors {
  const e: FormErrors = {};
  if (!data.name?.trim()) e.name = 'Product name is required';
  if (!data.category) e.category = 'Please select a category';
  if (!data.powerRating?.trim()) e.powerRating = 'Power rating is required';
  if (!data.description?.trim()) e.description = 'Description is required';
  return e;
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function FormSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 pb-2.5 border-b border-border/40">
        <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80 leading-none">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Inline error helper ──────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 animate-in fade-in-0 duration-150">
      <AlertTriangle size={11} />
      {message}
    </p>
  );
}

// ── EMPTY state ──────────────────────────────────────────────────────────────

const EMPTY: AdminProduct = {
  id: '',
  name: '',
  category: 'inverters',
  powerRating: '',
  description: '',
  image: '',
  performance: [],
  features: [],
  safety: [],
  idealFor: [],
  specifications: [],
  warranty: '',
  installation: '',
};

// ── Props ────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  initialData?: AdminProduct;
  onSave: (product: AdminProduct) => void;
  onCancel: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ProductForm({ initialData, onSave, onCancel }: ProductFormProps) {
  const [data, setData] = useState<AdminProduct>(
    initialData ? { ...EMPTY, ...initialData } : { ...EMPTY }
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Generic field updater
  const setField = useCallback(<K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
    if (submitted) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key as keyof FormErrors];
        return next;
      });
    }
  }, [submitted]);

  const inputCls = (field: keyof FormErrors) =>
    errors[field]
      ? 'border-destructive focus-visible:ring-destructive/30 bg-destructive/5'
      : 'bg-background/50 border-border/60 focus:border-primary/50';

  const selectCls = (field: keyof FormErrors) => [
    'flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors',
    errors[field]
      ? 'border-destructive focus:ring-destructive/30 bg-destructive/5'
      : 'border-border/60 bg-background/50 focus:border-primary/50',
  ].join(' ');

  const handleSubmit = () => {
    setSubmitted(true);
    const validationErrors = validate(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const product: AdminProduct = {
      ...data,
      id: data.id || Math.random().toString(36).substr(2, 9),
    };
    onSave(product);
  };

  const isFormValid = Object.keys(validate(data)).length === 0;

  return (
    <div className="flex flex-col gap-0">
      {/* Scrollable body */}
      <div className="overflow-y-auto max-h-[65vh] px-1 space-y-8 pr-3 pb-4">

        {/* ── 1. Basic Information ─────────────────────────────── */}
        <FormSection icon={<Tag size={14} />} title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-1.5">
              <Label htmlFor="pf-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-name"
                value={data.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="e.g. Lithium Pro 5kVA"
                className={inputCls('name')}
              />
              <FieldError message={errors.name} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-category" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Category <span className="text-destructive">*</span>
              </Label>
              <select
                id="pf-category"
                value={data.category}
                onChange={e => setField('category', e.target.value as AdminProduct['category'])}
                className={selectCls('category')}
              >
                <option value="" disabled>Select category</option>
                <option value="inverters">Inverters</option>
                <option value="batteries">Batteries</option>
                <option value="systems">All-in-One</option>
              </select>
              <FieldError message={errors.category} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-power" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Power Rating <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-power"
                value={data.powerRating}
                onChange={e => setField('powerRating', e.target.value)}
                placeholder="e.g. 5000VA / 4000W"
                className={inputCls('powerRating')}
              />
              <FieldError message={errors.powerRating} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="pf-desc" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Short Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="pf-desc"
                value={data.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Brief hook for listing pages — what makes this product stand out?"
                rows={3}
                className={inputCls('description')}
              />
              <FieldError message={errors.description} />
            </div>

          </div>
        </FormSection>

        {/* ── 2. Product Image ─────────────────────────────────── */}
        <FormSection icon={<ImageIcon size={14} />} title="Product Image">
          <ImageUploader
            value={data.image}
            onChange={val => setField('image', val)}
          />
        </FormSection>

        {/* ── 3. Performance Highlights ────────────────────────── */}
        <FormSection
          icon={<Activity size={14} />}
          title="Performance Highlights"
          subtitle="Top-line selling points shown prominently on the product page."
        >
          <DynamicListInput
            label=""
            placeholder="e.g. High efficiency power conversion"
            items={data.performance}
            onChange={val => setField('performance', val)}
          />
        </FormSection>

        {/* ── 4. Key Features ──────────────────────────────────── */}
        <FormSection
          icon={<Star size={14} />}
          title="Key Features"
          subtitle="Technical capabilities and standout feature bullets."
        >
          <DynamicListInput
            label=""
            placeholder="e.g. Pure Sine Wave Output"
            items={data.features}
            onChange={val => setField('features', val)}
          />
        </FormSection>

        {/* ── 5. Safety & Protection ───────────────────────────── */}
        <FormSection
          icon={<Shield size={14} />}
          title="Safety & Protection"
          subtitle="Built-in protection mechanisms for this product."
        >
          <DynamicListInput
            label=""
            placeholder="e.g. Overload Protection"
            items={data.safety}
            onChange={val => setField('safety', val)}
          />
        </FormSection>

        {/* ── 6. Ideal For ─────────────────────────────────────── */}
        <FormSection
          icon={<Target size={14} />}
          title="Ideal For"
          subtitle="Target use-cases — helps customers self-qualify."
        >
          <DynamicListInput
            label=""
            placeholder="e.g. Homes, Shops, Offices"
            items={data.idealFor}
            onChange={val => setField('idealFor', val)}
          />
        </FormSection>

        {/* ── 7. Technical Specifications ──────────────────────── */}
        <FormSection
          icon={<Settings2 size={14} />}
          title="Technical Specifications"
          subtitle="Key-value pairs displayed in the spec table on the detail page."
        >
          <SpecInput
            specs={data.specifications}
            onChange={val => setField('specifications', val)}
          />
        </FormSection>

        {/* ── 8. Additional Info ───────────────────────────────── */}
        <FormSection
          icon={<Info size={14} />}
          title="Additional Info"
          subtitle="Warranty and installation details shown at the bottom of the product page."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-1.5">
              <Label htmlFor="pf-warranty" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Wrench size={11} /> Warranty
              </Label>
              <Input
                id="pf-warranty"
                value={data.warranty}
                onChange={e => setField('warranty', e.target.value)}
                placeholder="e.g. 2 Years Standard Warranty"
                className="bg-background/50 border-border/60 focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-installation" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Wrench size={11} /> Installation
              </Label>
              <Input
                id="pf-installation"
                value={data.installation}
                onChange={e => setField('installation', e.target.value)}
                placeholder="e.g. Wall Mount / Floor Stand"
                className="bg-background/50 border-border/60 focus:border-primary/50"
              />
            </div>

          </div>
        </FormSection>

      </div>

      {/* ── Footer buttons ──────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> Required fields
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border/60 hover:border-border"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitted && !isFormValid}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed min-w-[130px]"
          >
            <Zap size={15} className="mr-2" />
            {initialData ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}
