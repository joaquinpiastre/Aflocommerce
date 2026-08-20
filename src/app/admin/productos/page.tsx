import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/lib/data/admin-products";
import { Button } from "@/components/ui/button";
import { ProductListTable } from "@/components/admin/product-list-table";

export const metadata: Metadata = { title: "Productos" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const products = await getAdminProducts(search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-foreground">Productos</h1>
        <Button className="gap-1.5" render={<Link href="/admin/productos/nuevo" />}>
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </div>
      <ProductListTable products={products} />
    </div>
  );
}
