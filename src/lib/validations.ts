import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export const addAdminSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .regex(/[a-zA-Z]/, "Name must contain letters"),
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  role: z.enum(['Manager', 'Product Manager', 'Production Unit'], {
    errorMap: () => ({ message: "Please select a valid role" })
  }),
  password: passwordSchema,
});

export const phoneSchema = z.string()
  .trim()
  .min(1, "Phone number is required")
  .regex(/^\+?[0-9\s-]{7,15}$/, "Please enter a valid phone number")
  .transform(value => value.replace(/[\s-]/g, ''));

export const addAppUserSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .regex(/[a-zA-Z]/, "Name must contain letters"),
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm the password"),
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: "Passwords do not match",
});

const todayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const PRODUCT_NUMBER_PATTERN = /^[A-Z0-9-]+$/;

export const normalizeProductNumber = (value: string) => value.trim().toUpperCase();

export const isValidProductNumber = (value: string) => {
  const normalizedValue = normalizeProductNumber(value);

  return normalizedValue.length >= 5 && PRODUCT_NUMBER_PATTERN.test(normalizedValue);
};

export const addManufacturedUnitSchema = z.object({
  productName: z.string()
    .trim()
    .min(1, "Product name is required")
    .min(3, "Product name must be at least 3 characters"),
  productNumber: z.string()
    .trim()
    .min(1, "Product number is required")
    .min(5, "Product number must be at least 5 characters")
    .transform(value => value.toUpperCase())
    .refine(value => !/\s/.test(value), "Product number cannot contain spaces")
    .refine(value => PRODUCT_NUMBER_PATTERN.test(value), "Use only letters, numbers, and hyphens"),
  category: z.enum(['Inverter', 'Battery', 'Solar', 'Other'], {
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  manufacturedDate: z.string()
    .min(1, "Manufactured date is required")
    .refine(value => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), "Please enter a valid date")
    .refine(value => value <= todayDate(), "Manufactured date cannot be in the future"),
  warrantyMonths: z.coerce.number({
    required_error: "Warranty period is required",
    invalid_type_error: "Warranty period must be a number"
  })
    .int("Warranty period must be a whole number")
    .positive("Warranty period must be a positive number")
    .max(240, "Warranty period cannot exceed 240 months"),
  status: z.enum(['Ready', 'Registered'], {
    errorMap: () => ({ message: "Please select a valid status" })
  }),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  slug: z.string().trim().min(1, "Slug is required"),
  category: z.enum(['inverters', 'batteries', 'systems']),
  powerRating: z.string().trim().min(1, "Power rating is required"),
  description: z.string().trim().min(1, "Description is required"),
  fullDescription: z.string().trim().optional().or(z.literal('')),
  image: z.string().url("Valid image URL is required").optional().or(z.literal('')),
  imagePublicId: z.string().optional().or(z.literal('')),
  performance: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
  safety: z.array(z.string()).optional().default([]),
  idealFor: z.array(z.string()).optional().default([]),
  specifications: z.array(z.object({
    key: z.string(),
    value: z.string()
  })).optional().default([]),
  warranty: z.string().optional().or(z.literal('')),
  warrantyMonths: z.number().int().min(0).optional().default(60),
  installation: z.string().optional().or(z.literal('')),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z.number().int().min(0),
});


export type LoginFormData = z.infer<typeof loginSchema>;
export type AddAdminFormData = z.infer<typeof addAdminSchema>;
export type AddAppUserFormData = z.infer<typeof addAppUserSchema>;
export type AddManufacturedUnitFormData = z.infer<typeof addManufacturedUnitSchema>;

export type PasswordStrengthCondition = {
  label: string;
  met: boolean;
};

export const checkPasswordStrength = (password: string): PasswordStrengthCondition[] => {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
};
