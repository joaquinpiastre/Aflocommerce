"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { deleteProduct, toggleProductField } from "@/server/actions/products";

type Product = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  basePrice: number;
  salePrice: number | null;
  active: boolean;
  featured: boolean;
  totalStock: number;
  variantCount: number;
  image: string | null;
};

export function ProductListTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [items, setItems] = useState(products);

  async function handleToggle(id: string, field: "active" | "featured", value: boolean) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    const result = await toggleProductField(id, field, value);
    if (!result.success) toast.error(result.error);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    const result = await deleteProduct(id);
    if (result.success) {
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Producto eliminado");
    } else {
      toast.error(result.error);
    }
    router.refresh();
  }

  return (
    <div className="overflow-x-auto border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Destacado</TableHead>
            <TableHead>Activo</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="flex items-center gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden bg-secondary">
                  {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" />}
                </div>
                <span className="font-medium text-foreground">{p.name}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.categoryName}</TableCell>
              <TableCell>
                {p.salePrice ? (
                  <span className="flex flex-col">
                    <span className="text-primary">{formatPrice(p.salePrice)}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(p.basePrice)}
                    </span>
                  </span>
                ) : (
                  formatPrice(p.basePrice)
                )}
              </TableCell>
              <TableCell>
                <Badge variant={p.totalStock === 0 ? "destructive" : "outline"}>
                  {p.totalStock} und. · {p.variantCount} var.
                </Badge>
              </TableCell>
              <TableCell>
                <Switch checked={p.featured} onCheckedChange={(v) => handleToggle(p.id, "featured", v)} />
              </TableCell>
              <TableCell>
                <Switch checked={p.active} onCheckedChange={(v) => handleToggle(p.id, "active", v)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/productos/${p.id}`} className="text-muted-foreground hover:text-accent">
                    <Pencil className="size-4" />
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
