import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Só usar rewrites em desenvolvimento
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },

  // Headers melhorados para CORS e cookies
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "production"
                ? process.env.BACKEND_URL || "*"
                : "*",
          },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie, Set-Cookie",
          },
          // Headers específicos para cookies
          { key: "Access-Control-Expose-Headers", value: "Set-Cookie" },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },

  // Configurações específicas para cookies em produção
  ...(process.env.NODE_ENV === "production" && {
    async redirects() {
      return [];
    },
  }),
};

export default nextConfig;
