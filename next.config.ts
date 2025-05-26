/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint:{
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jadwpjngawglckalitwe.supabase.co', 
        pathname: '/storage/v1/object/public/covers/**',
      },
    ],
  },
}

module.exports = nextConfig
