import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev server is often opened via 127.0.0.1 rather than localhost; without this
  // Next blocks its HMR/dev resources for that host and the client never hydrates.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
