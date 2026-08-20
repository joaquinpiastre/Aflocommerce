import type { Metadata } from "next";
import { getAllCategoriesFlat } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const categories = await getAllCategoriesFlat();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-foreground">Nuevo producto</h1>
      <ProductForm
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          parentName: c.parent?.name ?? null,
        }))}
      />
    </div>
  );
}
