"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CatalogFilters } from "./catalog-filters";

type FilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string }[];
  minPrice: number;
  maxPrice: number;
};

export function CatalogFiltersMobile({ options }: { options: FilterOptions }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <SlidersHorizontal className="size-4" />
        Filtros
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto border-border bg-card px-4">
        <SheetHeader>
          <SheetTitle className="font-display uppercase text-foreground">Filtros</SheetTitle>
        </SheetHeader>
        <CatalogFilters options={options} />
      </SheetContent>
    </Sheet>
  );
}
