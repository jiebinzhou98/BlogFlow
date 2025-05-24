/** @type {import('next').NextConfig} */
const nextConfig = {
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
