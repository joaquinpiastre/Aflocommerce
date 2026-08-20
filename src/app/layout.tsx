import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { CartSync } from "@/components/shared/cart-sync";
import "./globals.css";

const displayFont = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aflo | Indumentaria y accesorios streetwear",
    template: "%s | Aflo",
  },
  description:
    "Aflo — remeras, buzos, camperas, joggers, gorras, termos, vasos y mates. Streetwear con actitud.",
  icons: {
    icon: "/brand/aflo-logo-original.jpeg",
    shortcut: "/brand/aflo-logo-original.jpeg",
    apple: "/brand/aflo-logo-original.jpeg",
  },
  openGraph: {
    title: "Aflo | Indumentaria y accesorios streetwear",
    description:
      "Aflo — remeras, buzos, camperas, joggers, gorras, termos, vasos y mates. Streetwear con actitud.",
    url: siteUrl,
    siteName: "Aflo",
    images: [{ url: "/brand/aflo-logo-original.jpeg", width: 819, height: 1214 }],
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`dark ${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          {children}
          <CartSync />
          <Toaster richColors position="bottom-right" theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
