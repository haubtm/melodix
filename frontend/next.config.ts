/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    // Allow unoptimized images for external URLs
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Transpile specific packages if needed
  transpilePackages: ["antd", "@ant-design/icons"],

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Environment variables
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },
};

export default nextConfig;
