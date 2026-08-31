import type { Metadata } from "next";
import { Mail, AtSign } from "lucide-react";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-4 text-4xl text-foreground">Contacto</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        ¿Dudas sobre un pedido, un cambio o el estado de tu compra? Escribinos por acá.
      </p>
      <div className="space-y-4">
        <a
          href="mailto:contacto@aflo.com"
          className="flex items-center gap-3 border border-border bg-card p-4 text-sm text-foreground transition-colors hover:border-accent"
        >
          <Mail className="size-5 text-accent" />
          contacto@aflo.com
        </a>
        <a
          href="https://instagram.com/aflo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 border border-border bg-card p-4 text-sm text-foreground transition-colors hover:border-accent"
        >
          <AtSign className="size-5 text-accent" />
          @aflo
        </a>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        Si tu consulta es sobre un pedido puntual, incluí el número de orden (lo encontrás en{" "}
        <a href="/cuenta/pedidos" className="text-accent hover:underline">
          Mis pedidos
        </a>
        ) para que te podamos ayudar más rápido.
      </p>
    </div>
  );
}
