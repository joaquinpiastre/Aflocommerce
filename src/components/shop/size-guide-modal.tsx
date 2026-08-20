"use client";

import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CLOTHING_GUIDE = [
  { size: "S", chest: "88-92", length: "68" },
  { size: "M", chest: "93-97", length: "70" },
  { size: "L", chest: "98-104", length: "72" },
  { size: "XL", chest: "105-111", length: "74" },
  { size: "XXL", chest: "112-118", length: "76" },
];

export function SizeGuideModal({ isClothing }: { isClothing: boolean }) {
  if (!isClothing) return null;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="link" className="h-auto gap-1 p-0 text-xs text-muted-foreground hover:text-accent" />
        }
      >
        <Ruler className="size-3.5" />
        Guía de talles
      </DialogTrigger>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display uppercase text-foreground">Guía de talles</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Talle</TableHead>
              <TableHead>Contorno de pecho (cm)</TableHead>
              <TableHead>Largo total (cm)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CLOTHING_GUIDE.map((row) => (
              <TableRow key={row.size}>
                <TableCell className="font-medium">{row.size}</TableCell>
                <TableCell>{row.chest}</TableCell>
                <TableCell>{row.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground">
          Medidas de referencia en centímetros. Ante dudas entre dos talles, recomendamos elegir el mayor
          para un calce más oversize, típico del corte Aflo.
        </p>
      </DialogContent>
    </Dialog>
  );
}
