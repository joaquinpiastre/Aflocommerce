import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    // El admin puede cargar imágenes de producto pegando cualquier URL
    // (todavía no hay UploadThing conectado), así que permitimos cualquier
    // host https en vez de una lista fija — si no, cualquier imagen de un
    // dominio no listado rompía con un 400 al optimizarla.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
