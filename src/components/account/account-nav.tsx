"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

const LINKS = [
  { href: "/cuenta", label: "Mi perfil" },
  { href: "/cuenta/pedidos", label: "Mis pedidos" },
  { href: "/cuenta/direcciones", label: "Direcciones" },
  { href: "/cuenta/favoritos", label: "Favoritos" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto border-b border-border pb-2 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:pr-4 lg:pb-0">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:text-accent"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive"
      >
        <LogOut className="size-3.5" />
        Cerrar sesión
      </button>
    </nav>
  );
}
