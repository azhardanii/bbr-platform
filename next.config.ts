import type { NextConfig } from "next";

const noCacheHeaders = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/dashboard/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/dashboard",
        headers: noCacheHeaders,
      },
      {
        source: "/profil/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/profil",
        headers: noCacheHeaders,
      },
      {
        source: "/monitoring/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/monitoring",
        headers: noCacheHeaders,
      },
      {
        source: "/tools/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/sidang/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/sidang",
        headers: noCacheHeaders,
      },
      {
        source: "/workspace/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/workspace",
        headers: noCacheHeaders,
      },
      {
        source: "/onboarding/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/onboarding",
        headers: noCacheHeaders,
      },
    ];
  },
};

export default nextConfig;
