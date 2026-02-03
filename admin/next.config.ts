/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
    unoptimized: process.env.NODE_ENV === "development",
  },

  transpilePackages: ["antd", "@ant-design/icons", "@ant-design/charts"],

  poweredByHeader: false,
};

export default nextConfig;
