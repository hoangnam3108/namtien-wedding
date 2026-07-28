import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Bỏ qua lỗi TypeScript khi build trên Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bỏ qua lỗi ESLint cảnh báo cú pháp khi build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;