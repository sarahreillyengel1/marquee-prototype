/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse v1 has a quirk where webpack-bundling it triggers a test-file
  // read at module init that fails in serverless environments. Marking it
  // external tells Next.js to load it via Node's regular require at runtime.
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

export default nextConfig;
