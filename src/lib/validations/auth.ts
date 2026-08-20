import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresá un email válido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Ingresá tu nombre completo"),
    email: z.string().email("Ingresá un email válido"),
    phone: z.string().optional(),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresá un email válido"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, "Ingresá tu nombre completo"),
  phone: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(3, "Ingresá la calle y número"),
  city: z.string().min(2, "Ingresá la ciudad"),
  province: z.string().min(2, "Ingresá la provincia"),
  postalCode: z.string().min(3, "Ingresá el código postal"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
