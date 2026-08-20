"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/constants";
import { updateOrderStatus } from "@/server/actions/admin-orders";

type Order = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  user: { name: string | null; email: string };
  items: { quantity: number }[];
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [items, setItems] = useState(orders);

  async function handleStatusChange(id: string, status: OrderStatus) {
    setItems((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const result = await updateOrderStatus(id, status);
    if (!result.success) toast.error(result.error);
    else toast.success("Estado actualizado");
  }

  return (
    <div className="overflow-x-auto border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link href={`/admin/ventas/${order.orderNumber}`} className="font-medium text-foreground hover:text-accent">
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
              <TableCell>
                <p className="text-foreground">{order.user.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{order.user.email}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.items.reduce((acc, i) => acc + i.quantity, 0)} und.
              </TableCell>
              <TableCell className="font-medium text-foreground">{formatPrice(order.total)}</TableCell>
              <TableCell className="text-muted-foreground">
                {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
              </TableCell>
              <TableCell>
                <Select value={order.status} onValueChange={(v) => v && handleStatusChange(order.id, v as OrderStatus)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
