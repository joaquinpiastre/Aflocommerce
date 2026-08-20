import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
