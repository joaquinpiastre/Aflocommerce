import { z } from "zod";

export const checkoutItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().min(1),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "El carrito está vacío"),
  addressId: z.string().optional(),
  newAddress: z
    .object({
      label: z.string().optional(),
      street: z.string().min(3, "Ingresá la calle y número"),
      city: z.string().min(2, "Ingresá la ciudad"),
      province: z.string().min(2, "Ingresá la provincia"),
      postalCode: z.string().min(3, "Ingresá el código postal"),
      phone: z.string().optional(),
    })
    .optional(),
  saveAddress: z.boolean().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
