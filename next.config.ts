import type { NextConfig } from "next";

const nextConfig: NextConfig = {

   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**", // Permite cualquier ruta interna dentro de ese dominio
      },
      {
        protocol:'https',
        hostname:'udnekzbelqkszrqqmkrw.supabase.co',
        port:"",
        pathname:"/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
