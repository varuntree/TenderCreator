import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

const nextConfig: NextConfig = {
  // Standalone output for Vercel (reduces bundle size)
  output: 'standalone',

  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],

  // External packages (don't bundle)
  serverExternalPackages: ['docx'],

  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https' as const,
        hostname: '**.supabase.co',
      },
    ],
  },
}

export default withMDX(nextConfig)
