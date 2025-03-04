import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "computercenter.s3.ap-south-1.amazonaws.com",
        pathname: "/images/**", // ✅ Fix: Add leading '/'
      },
    ],
  },
};

export default nextConfig;
