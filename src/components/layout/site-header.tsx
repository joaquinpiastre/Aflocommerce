import { getTopLevelCategories } from "@/lib/data/categories";
import { Header } from "./header";

export async function SiteHeader() {
  const categories = await getTopLevelCategories();
  const navCategories = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    children: c.children.map((child) => ({ name: child.name, slug: child.slug })),
  }));

  return <Header categories={navCategories} />;
}
