import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "chat-app-backend-105f.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;