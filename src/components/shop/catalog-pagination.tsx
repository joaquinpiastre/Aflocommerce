import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CatalogPagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page") continue;
      if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
      else if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/catalogo${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-12">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        render={page > 1 ? <Link href={buildHref(page - 1)} /> : undefined}
      >
        Anterior
      </Button>
      <span className="px-3 text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        render={page < totalPages ? <Link href={buildHref(page + 1)} /> : undefined}
      >
        Siguiente
      </Button>
    </div>
  );
}
