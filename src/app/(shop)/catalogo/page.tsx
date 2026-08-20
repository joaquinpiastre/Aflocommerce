import type { Metadata } from "next";
import { getProducts, getAvailableFilterOptions, type SortOption } from "@/lib/data/products";
import { ProductGrid } from "@/components/shop/product-grid";
import { CatalogFilters } from "@/components/shop/catalog-filters";
import { CatalogFiltersMobile } from "@/components/shop/catalog-filters-mobile";
import { CatalogSort } from "@/components/shop/catalog-sort";
import { CatalogPagination } from "@/components/shop/catalog-pagination";

export const metadata: Metadata = { title: "Catálogo" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function all(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const search = first(params.search);
  const categorySlug = first(params.categoria);
  const sizes = all(params.talle);
  const colors = all(params.color);
  const minPrice = first(params.min) ? Number(first(params.min)) : undefined;
  const maxPrice = first(params.max) ? Number(first(params.max)) : undefined;
  const inStockOnly = first(params.stock) === "1";
  const sort = (first(params.sort) as SortOption) ?? "relevancia";
  const page = first(params.page) ? Number(first(params.page)) : 1;

  const [{ items, total, totalPages }, filterOptions] = await Promise.all([
    getProducts({
      search,
      categorySlug,
      sizes,
      colors,
      minPrice,
      maxPrice,
      inStockOnly,
      sort,
      page,
      pageSize: 12,
    }),
    getAvailableFilterOptions(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="text-4xl text-foreground sm:text-5xl">
          {categorySlug ? categorySlug.replace(/-/g, " ") : "Catálogo"}
        </h1>
        <p className="text-sm text-muted-foreground">{total} producto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <CatalogFilters options={filterOptions} />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-4 lg:justify-end">
            <div className="lg:hidden">
              <CatalogFiltersMobile options={filterOptions} />
            </div>
            <CatalogSort />
          </div>

          <ProductGrid products={items} />
          <CatalogPagination page={page} totalPages={totalPages} searchParams={params} />
        </div>
      </div>
    </div>
  );
}
