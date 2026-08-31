import type { Metadata } from "next";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_COST } from "@/lib/constants";

export const metadata: Metadata = { title: "Envíos" };

export default function ShippingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-8 text-4xl text-foreground">Envíos</h1>
      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 font-display text-lg uppercase text-foreground">Costo de envío</h2>
          <p>
            El envío tiene un costo fijo de {formatPrice(FLAT_SHIPPING_COST)} a todo el país. En
            compras desde {formatPrice(FREE_SHIPPING_THRESHOLD)} el envío es <strong className="text-foreground">gratis</strong>.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg uppercase text-foreground">Tiempos de entrega</h2>
          <p>
            Una vez confirmado el pago, preparamos el pedido en 24-48hs hábiles. El tiempo de
            entrega estimado es de 3 a 7 días hábiles según la localidad.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg uppercase text-foreground">Seguimiento</h2>
          <p>
            Podés seguir el estado de tu pedido desde{" "}
            <a href="/cuenta/pedidos" className="text-accent hover:underline">
              Mi cuenta → Mis pedidos
            </a>
            . Te avisamos por email cuando cambie de estado.
          </p>
        </section>
      </div>
    </div>
  );
}
