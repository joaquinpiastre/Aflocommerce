"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, User, Heart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavCategory = { name: string; slug: string; children: { name: string; slug: string }[] };

export function Header({ categories }: { categories: NavCategory[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const count = cartCount(items);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/catalogo${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
            <Menu />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-border bg-card">
            <SheetHeader>
              <SheetTitle className="font-display text-xl uppercase text-foreground">Aflo</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {categories.map((cat) => (
                <div key={cat.slug} className="py-2">
                  <Link
                    href={`/catalogo?categoria=${cat.slug}`}
                    className="font-display text-sm uppercase tracking-wide text-foreground hover:text-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.name}
                  </Link>
                  {cat.children.length > 0 && (
                    <div className="mt-1 flex flex-col gap-1 pl-3">
                      {cat.children.map((child) => (
                        <Link
                          key={child.slug}
                          href={`/catalogo?categoria=${child.slug}`}
                          className="text-sm text-muted-foreground hover:text-accent"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/brand/aflo-logo-original.jpeg"
            alt="Aflo"
            width={36}
            height={53}
            className="rounded-sm"
          />
          <span className="font-display text-xl uppercase tracking-wide text-foreground">Aflo</span>
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          {categories.map((cat) => (
            <div key={cat.slug} className="group relative">
              <Link
                href={`/catalogo?categoria=${cat.slug}`}
                className="font-display text-sm uppercase tracking-wide text-foreground/90 transition-colors hover:text-accent"
              >
                {cat.name}
              </Link>
              {cat.children.length > 0 && (
                <div className="invisible absolute left-0 top-full z-10 min-w-40 translate-y-1 rounded-sm border border-border bg-card py-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                  {cat.children.map((child) => (
                    <Link
                      key={child.slug}
                      href={`/catalogo?categoria=${child.slug}`}
                      className="block px-4 py-1.5 text-sm text-foreground/80 hover:bg-secondary hover:text-accent"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="ml-auto hidden max-w-xs flex-1 items-center sm:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-2">
          <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => router.push("/catalogo")}>
            <Search />
          </Button>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                <User />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem render={<Link href="/cuenta" />}>Mi cuenta</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/cuenta/pedidos" />}>Mis pedidos</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/cuenta/favoritos" />}>Favoritos</DropdownMenuItem>
                {session.user.role === "ADMIN" && (
                  <DropdownMenuItem render={<Link href="/admin" />}>Panel admin</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" render={<Link href="/login" />}>
              <User />
            </Button>
          )}

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" render={<Link href="/cuenta/favoritos" />}>
            <Heart />
          </Button>

          <Button variant="ghost" size="icon" className="relative" render={<Link href="/carrito" />}>
            <ShoppingBag />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
