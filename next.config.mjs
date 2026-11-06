// LAYER: Build & Framework Configuration
// Next.js configuration options.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // Disable filesystem pack caching on Windows builds to prevent transient rename locks
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
