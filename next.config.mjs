import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: false,
  swcMinify: true,
  exclude: [
    ({ asset }) => {
      // Exclude files that cause constant recompiles
      return (
        asset.name.startsWith("server/") ||
        asset.name.endsWith(".hot-update.js")
      );
    },
  ],
  workboxOptions: {
    disableDevLogs: true,
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
