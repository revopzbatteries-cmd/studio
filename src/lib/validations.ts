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

const todayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addManufacturedUnitSchema = z.object({
  productName: z.string()
    .trim()
    .min(1, "Product name is required")
    .min(3, "Product name must be at least 3 characters"),
  productNumber: z.string()
    .trim()
    .min(1, "Product number is required")
    .transform(value => value.toUpperCase())
    .refine(value => !/\s/.test(value), "Product number cannot contain spaces"),
  category: z.enum(['Inverter', 'Battery', 'Solar', 'Other'], {
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  manufacturingDate: z.string()
    .min(1, "Manufacturing date is required")
    .refine(value => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), "Please enter a valid date")
    .refine(value => value <= todayDate(), "Manufacturing date cannot be in the future"),
  warrantyMonths: z.coerce.number({
    required_error: "Warranty period is required",
    invalid_type_error: "Warranty period must be a number"
  })
    .int("Warranty period must be a whole number")
    .positive("Warranty period must be a positive number"),
  status: z.enum(['Ready', 'Registered'], {
    errorMap: () => ({ message: "Please select a valid status" })
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type AddAdminFormData = z.infer<typeof addAdminSchema>;
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
