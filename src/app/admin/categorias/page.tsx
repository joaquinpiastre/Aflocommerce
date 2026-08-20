import type { Metadata } from "next";
import { getAllCategoriesFlat } from "@/lib/data/categories";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Categorías" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesFlat();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-foreground">Categorías</h1>
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image,
          parentId: c.parentId,
        }))}
      />
    </div>
  );
}
