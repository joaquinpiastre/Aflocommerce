import type { NextAuthConfig } from "next-auth";

/**
 * Config edge-safe (sin Prisma adapter ni bcrypt) para poder usarse
 * en el middleware, que corre en el Edge Runtime. La configuración
 * completa (con adapter + providers) vive en `auth.ts`.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const role = auth?.user?.role;

      const isAdminRoute = pathname.startsWith("/admin");
      const isAccountRoute = pathname.startsWith("/cuenta");
      const isCheckoutRoute = pathname.startsWith("/checkout");

      if (isAdminRoute) {
        return isLoggedIn && role === "ADMIN";
      }

      if (isAccountRoute || isCheckoutRoute) {
        return isLoggedIn;
      }

      return true;
    },
    // Vive acá (no solo en auth.ts) porque el middleware usa esta config
    // edge-safe directamente: sin este callback, `auth.user.role` llega
    // undefined al `authorized` de arriba y /admin rechaza siempre.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
