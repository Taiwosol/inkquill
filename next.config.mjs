import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
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
