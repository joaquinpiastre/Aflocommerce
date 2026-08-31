# Aflo — Ecommerce

Ecommerce completo para **Aflo**, marca de indumentaria y accesorios streetwear
(remeras, buzos, camperas, joggers, gorras, musculosas, termos, vasos y mates).

Construido con Next.js 14+ (App Router), TypeScript, Tailwind CSS + shadcn/ui
y Prisma + PostgreSQL.

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Estilos:** Tailwind CSS v4 + shadcn/ui, tema oscuro Aflo (negro / rojo / dorado)
- **Base de datos:** PostgreSQL + Prisma ORM
- **Auth:** Auth.js (NextAuth v5) — credenciales (email/contraseña) + Google OAuth
- **Pagos:** manuales (efectivo o transferencia) — la orden queda "Pendiente" y un admin la marca como "Pagado" desde el panel una vez confirmado el pago por fuera de la web
- **Imágenes:** Vercel Blob (categorías, con subida real de archivos) + UploadThing (productos, pendiente de conectar)
- **Validación:** Zod + React Hook Form
- **Gráficos admin:** Recharts

## Requisitos previos

- Node.js 20+
- Una base PostgreSQL (local vía Docker, o Neon / Supabase para producción)

## Puesta en marcha (desarrollo local)

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar las variables de entorno y completarlas:

   ```bash
   cp .env.example .env
   ```

   Ver la sección [Variables de entorno](#variables-de-entorno) para el detalle de cada una.

3. **Base de datos local con Docker** (recomendado para desarrollo):

   ```bash
   docker run -d --name aflo-postgres \
     -e POSTGRES_USER=aflo \
     -e POSTGRES_PASSWORD=aflo_dev_password \
     -e POSTGRES_DB=aflo \
     -p 5433:5432 postgres:16-alpine
   ```

   > Se usa el puerto **5433** en el host (en vez de 5432) porque en esta máquina
   > ya hay un PostgreSQL nativo escuchando en 5432; si tu máquina no tiene
   > ningún Postgres corriendo, podés usar `-p 5432:5432` y ajustar la URL de abajo.

   Y en `.env`:

   ```
   DATABASE_URL="postgresql://aflo:aflo_dev_password@localhost:5433/aflo?schema=public"
   ```

   Para producción, reemplazar por el connection string de [Neon](https://neon.tech) o [Supabase](https://supabase.com).

4. Aplicar el schema y cargar los datos de ejemplo:

   ```bash
   npm run db:push    # crea las tablas según prisma/schema.prisma
   npm run db:seed    # carga categorías, ~15 productos con variantes, usuarios y órdenes de ejemplo
   ```

   (Alternativa con historial de migraciones versionado: `npm run db:migrate`.)

5. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000](http://localhost:3000).

### Usuarios de prueba (creados por el seed)

| Rol      | Email             | Contraseña   |
| -------- | ----------------- | ------------ |
| Admin    | admin@aflo.com    | Admin123!    |
| Cliente  | cliente@aflo.com  | Cliente123!  |

## Variables de entorno

Ver [`.env.example`](./.env.example) para el listado completo y comentado. Resumen:

| Variable                              | Requerida | Descripción                                                            |
| -------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`                         | Sí        | Connection string de PostgreSQL                                        |
| `AUTH_SECRET`                          | Sí        | Secreto de Auth.js (`npx auth secret`)                                  |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL`| Sí        | URL pública del sitio                                                  |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`| No        | Credenciales OAuth de Google. Si faltan, se oculta el login con Google |
| `BLOB_READ_WRITE_TOKEN`                | Sí (ya configurada en Vercel) | Vercel Blob, para subir imágenes de categorías desde el admin |
| `UPLOADTHING_TOKEN`                    | No        | Token de UploadThing para subir imágenes de productos desde el admin (todavía usa URL)    |
| `RESEND_API_KEY` / `EMAIL_FROM`        | No        | Envío de emails transaccionales (confirmación de orden)                 |

## Estructura del proyecto

```
prisma/
  schema.prisma      # modelos (User, Product, ProductVariant, Order, etc.)
  seed.ts            # datos de ejemplo
src/
  app/               # rutas de Next.js (App Router)
  components/        # componentes UI (shadcn en components/ui, resto por dominio)
  lib/                # utilidades, cliente de Prisma, constantes de marca
  server/             # server actions y lógica de servidor
public/
  brand/              # logo e identidad visual de Aflo
```

## Modelo de datos

El catálogo maneja **variantes de producto** (talle + color) con **stock y SKU
independientes por variante** (`ProductVariant`), no por producto. Todo el
descuento de stock en las compras se hace contra la variante específica
comprada, nunca contra el producto en general.

## Deploy

Preparado para [Vercel](https://vercel.com). Estado actual del deploy:

- **Repo:** [github.com/joaquinpiastre/Aflocommerce](https://github.com/joaquinpiastre/Aflocommerce) (rama `main`), conectado a Vercel — cada push a `main` dispara un deploy de producción automático.
- **Producción:** https://aflo-ecommerce.vercel.app
- **Base de datos:** PostgreSQL en [Railway](https://railway.app) (proyecto `aflo-ecommerce`), con proxy TCP público para que Vercel se conecte. `DATABASE_URL` ya está cargada como variable de entorno en Vercel (Production).
- **Variables ya configuradas en Vercel:** `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`.
- **Vercel Blob:** store `aflo-images` creado y enlazado al proyecto (`BLOB_READ_WRITE_TOKEN` ya configurado en los 3 entornos de Vercel) — usado para la subida real de imágenes de categorías.
- **Pendientes de configurar cuando estén disponibles** (ver tabla de variables arriba): `AUTH_GOOGLE_ID`/`SECRET`, `UPLOADTHING_TOKEN`, `RESEND_API_KEY`. Mientras falten, el sitio funciona en modo mock/oculto para esas integraciones (ver secciones correspondientes).

### Recrear el deploy desde cero (referencia)

1. Crear una base Postgres (Railway, Neon o Supabase) y obtener el `DATABASE_URL` **público** (con Railway: crear un TCP Proxy en el servicio de Postgres, ya que el `DATABASE_URL` interno no es accesible desde Vercel).
2. `npx vercel link` para crear/enlazar el proyecto de Vercel.
3. `npx vercel env add DATABASE_URL production --value "..."` (repetir para `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL` y el resto de variables necesarias).
4. `DATABASE_URL="..." npm run db:push && DATABASE_URL="..." npm run db:seed` contra la base de producción.
5. `npx vercel --prod` para deployar.

## Estado del proyecto

Las 7 fases (setup, auth, tienda, checkout, cuenta, admin, pulido) están
completas y verificadas de punta a punta en local. El proyecto ya está
deployado en Vercel + Railway (ver sección Deploy arriba).
