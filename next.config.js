/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '64mb',
    },
  },
}

module.exports = nextConfig
