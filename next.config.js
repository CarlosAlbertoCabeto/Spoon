/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        module: false,
        http2: false,
      };
    }
    return config;
  },
  reactStrictMode: true,
  experimental: {
    // Desactivamos las opciones experimentales que pueden causar conflictos
    scrollRestoration: true,
  },
  // Aseguramos compatibilidad con versiones más nuevas de React
  images: {
    unoptimized: true,
  }
};

module.exports = nextConfig;