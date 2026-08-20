import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <p className="font-display text-9xl text-primary">404</p>
      <h1 className="text-3xl text-foreground">Esta página se perdió en la manada</h1>
      <p className="max-w-md text-muted-foreground">
        No encontramos lo que buscabas. Volvé al catálogo y seguí explorando Aflo.
      </p>
      <div className="flex gap-4">
        <Button size="lg" render={<Link href="/" />}>
          Volver al inicio
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/catalogo" />}>
          Ver catálogo
        </Button>
      </div>
    </div>
  );
}
