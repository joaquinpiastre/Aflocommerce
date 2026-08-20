import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/aflo-logo-original.jpeg"
              alt="Aflo"
              width={32}
              height={47}
              className="rounded-sm"
            />
            <span className="font-display text-lg uppercase tracking-wide text-foreground">Aflo</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Streetwear con actitud. Indumentaria, termos, vasos, mates y accesorios.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-foreground">Tienda</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/catalogo?categoria=indumentaria" className="hover:text-accent">Indumentaria</Link></li>
            <li><Link href="/catalogo?categoria=termos" className="hover:text-accent">Termos</Link></li>
            <li><Link href="/catalogo?categoria=vasos" className="hover:text-accent">Vasos</Link></li>
            <li><Link href="/catalogo?categoria=mates" className="hover:text-accent">Mates</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-foreground">Mi cuenta</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/cuenta" className="hover:text-accent">Mi perfil</Link></li>
            <li><Link href="/cuenta/pedidos" className="hover:text-accent">Mis pedidos</Link></li>
            <li><Link href="/cuenta/favoritos" className="hover:text-accent">Favoritos</Link></li>
            <li><Link href="/carrito" className="hover:text-accent">Carrito</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-foreground">Ayuda</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/envios" className="hover:text-accent">Envíos</Link></li>
            <li><Link href="/cambios-y-devoluciones" className="hover:text-accent">Cambios y devoluciones</Link></li>
            <li><Link href="/contacto" className="hover:text-accent">Contacto</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Aflo. Todos los derechos reservados.
      </div>
    </footer>
  );
}
