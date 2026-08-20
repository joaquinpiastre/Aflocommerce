import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, "Ingresá el talle/tamaño"),
  colorName: z.string().min(1, "Ingresá el nombre del color"),
  colorHex: z.string().min(4, "Ingresá el color en hex"),
  sku: z.string().min(1, "Ingresá el SKU"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  price: z.number().min(0).optional().nullable(),
});

export type VariantFormInput = z.infer<typeof variantSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Ingresá el nombre del producto"),
  description: z.string().min(10, "Ingresá una descripción (mínimo 10 caracteres)"),
  material: z.string().optional(),
  categoryId: z.string().min(1, "Elegí una categoría"),
  basePrice: z.number().positive("El precio debe ser mayor a 0"),
  salePrice: z.number().positive().optional().nullable(),
  images: z.array(z.string().url("URL de imagen inválida")).min(1, "Agregá al menos una imagen"),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  variants: z.array(variantSchema).min(1, "Agregá al menos una variante (talle/color)"),
});

export type ProductFormInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Ingresá el nombre de la categoría"),
  description: z.string().optional(),
  image: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  parentId: z.string().optional().nullable(),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;
