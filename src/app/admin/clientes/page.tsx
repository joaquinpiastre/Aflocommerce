import type { Metadata } from "next";
import { getCustomers } from "@/lib/data/admin-customers";
import { formatDate, formatPrice } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Clientes" };

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-foreground">Clientes</h1>
      <div className="overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Total gastado</TableHead>
              <TableHead>Última compra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-foreground">{c.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  <p>{c.email}</p>
                  {c.phone && <p className="text-xs">{c.phone}</p>}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                <TableCell>{c.ordersCount}</TableCell>
                <TableCell className="font-medium text-foreground">{formatPrice(c.totalSpent)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
