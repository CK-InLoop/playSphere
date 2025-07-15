/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['framer-motion'],
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
