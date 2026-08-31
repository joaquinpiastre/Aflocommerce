import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cambios y devoluciones" };

export default function ReturnsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-8 text-4xl text-foreground">Cambios y devoluciones</h1>
      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 font-display text-lg uppercase text-foreground">Plazo</h2>
          <p>
            Tenés hasta 30 días corridos desde que recibís tu pedido para solicitar un cambio de
            talle/color o una devolución, siempre que el producto no esté usado y conserve sus
            etiquetas originales.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg uppercase text-foreground">Cómo solicitarlo</h2>
          <p>
            Escribinos desde la página de{" "}
            <a href="/contacto" className="text-accent hover:underline">
              Contacto
            </a>{" "}
            indicando tu número de orden (lo encontrás en{" "}
            <a href="/cuenta/pedidos" className="text-accent hover:underline">
              Mis pedidos
            </a>
            ) y te coordinamos el cambio o la devolución.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg uppercase text-foreground">Reintegro</h2>
          <p>
            Si el pago fue en efectivo o transferencia, el reintegro se hace por el mismo medio en
            un plazo de hasta 5 días hábiles desde que recibimos el producto devuelto.
          </p>
        </section>
      </div>
    </div>
  );
}
