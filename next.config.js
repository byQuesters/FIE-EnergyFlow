/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Deshabilitar la generación de páginas estáticas para las API routes
  experimental: {
    serverActions: false,
  },
}

module.exports = nextConfig
