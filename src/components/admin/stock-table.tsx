"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateVariantStock } from "@/server/actions/stock";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

type StockRow = {
  id: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  stock: number;
  productName: string;
  categoryName: string;
  image: string | null;
};

export function StockTable({ rows }: { rows: StockRow[] }) {
  const [data, setData] = useState(rows);
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSave(id: string, value: number) {
    setSaving(id);
    const result = await updateVariantStock(id, value);
    setSaving(null);
    if (result.success) {
      setData((prev) => prev.map((r) => (r.id === id ? { ...r, stock: value } : r)));
      toast.success("Stock actualizado");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="overflow-x-auto border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Talle</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="flex items-center gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden bg-secondary">
                  {row.image && <Image src={row.image} alt={row.productName} fill className="object-cover" />}
                </div>
                <span className="text-foreground">{row.productName}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.categoryName}</TableCell>
              <TableCell>{row.size}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-3 rounded-full border border-border" style={{ backgroundColor: row.colorHex }} />
                  {row.colorName}
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{row.sku}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={row.stock}
                    className="w-20"
                    disabled={saving === row.id}
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (value !== row.stock) handleSave(row.id, value);
                    }}
                  />
                  {row.stock <= LOW_STOCK_THRESHOLD && (
                    <Badge variant={row.stock === 0 ? "destructive" : "outline"}>bajo</Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
