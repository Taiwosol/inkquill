import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // Keep enabled for testing in development
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: false,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  webpack: true,
  experimental: {
    scrollRestoration: true,
    appNewScrollHandler: true,
  },
};

export default withPWA(nextConfig);
