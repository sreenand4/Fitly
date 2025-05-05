import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.klingai.com",
      },
      {
        protocol: 'https',
        hostname: '*.s3.us-east-2.amazonaws.com',
      },
    ]
  }
};

export default nextConfig;
