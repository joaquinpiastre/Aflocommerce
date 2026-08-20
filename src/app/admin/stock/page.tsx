import type { Metadata } from "next";
import { getStockOverview } from "@/lib/data/admin-stock";
import { StockTable } from "@/components/admin/stock-table";

export const metadata: Metadata = { title: "Control de stock" };

export default async function AdminStockPage() {
  const rows = await getStockOverview();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-foreground">Control de stock</h1>
      <p className="text-sm text-muted-foreground">
        Editá el stock directamente y presioná Tab o hacé clic fuera del campo para guardar.
      </p>
      <StockTable rows={rows} />
    </div>
  );
}
