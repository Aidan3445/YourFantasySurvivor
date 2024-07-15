/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
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
        pathname: '*',
      },

    ],
  },
};

export default config;
