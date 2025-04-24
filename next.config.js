/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  crossOrigin: 'anonymous',
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/*.png',
      },
      {
        protocol: 'https',
        hostname: 'c.tenor.com',
        port: '',
        pathname: '/*/tenor.gif',
      },
      {
        protocol: 'https',
        hostname: 'parade.com',
        port: '',
        pathname: '/.image/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/150',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/dms/image/**',
      },
      {
        protocol: 'https',
        hostname: 'www.truedorktimes.com',
        port: '',
        pathname: '/*/images/**',
      },
      {
        protocol: 'https',
        hostname: 'imagesvc.meredithcorp.io',
        port: '',
        pathname: '/v3/mm/**',
      },
      {
        protocol: 'https',
        hostname: 'external-preview.redd.it',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
        port: '',
        pathname: '/id/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/photo-**',
      },
      {
        protocol: 'https',
        hostname: 'img.buymeacoffee.com',
        port: '',
        pathname: '/**',

      }
    ],
  },
};

export default config;
