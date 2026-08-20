"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Receipt,
  Users,
  Boxes,
  LogOut,
  Store,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
  { href: "/admin/ventas", label: "Ventas", icon: Receipt },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/stock", label: "Stock", icon: Boxes },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-row overflow-x-auto border-b border-border bg-card lg:h-screen lg:w-60 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r">
      <div className="hidden shrink-0 items-center gap-2 border-b border-border px-4 py-5 lg:flex">
        <span className="font-display text-lg uppercase tracking-wide text-foreground">Aflo Admin</span>
      </div>
      <nav className="flex flex-1 flex-row gap-1 p-2 lg:flex-col lg:p-3">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex shrink-0 flex-row gap-1 border-t border-border p-2 lg:flex-col lg:p-3">
        <Link
          href="/"
          className="flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-accent"
        >
          <Store className="size-4" />
          Ver tienda
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
