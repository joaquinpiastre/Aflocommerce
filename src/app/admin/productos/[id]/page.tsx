import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/data/admin-products";
import { getAllCategoriesFlat } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProductById(id), getAllCategoriesFlat()]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-foreground">Editar producto</h1>
      <ProductForm
        productId={product.id}
        defaultValues={{
          name: product.name,
          description: product.description,
          material: product.material ?? "",
          categoryId: product.categoryId,
          basePrice: product.basePrice,
          salePrice: product.salePrice,
          images: product.images,
          featured: product.featured,
          active: product.active,
          variants: product.variants,
        }}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          parentName: c.parent?.name ?? null,
        }))}
      />
    </div>
  );
}
