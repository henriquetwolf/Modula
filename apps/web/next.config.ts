import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@modula/supabase'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cfouqzgwdvmoafvfsnvd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
