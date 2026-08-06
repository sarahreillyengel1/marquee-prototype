/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse v1 has a quirk where webpack-bundling it triggers a test-file
  // read at module init that fails in serverless environments. Marking it
  // external tells Next.js to load it via Node's regular require at runtime.
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  // TEMPORARY (beta): don't fail the build on ESLint warnings/errors. The repo is
  // being built by two parallel workstreams (profile system + blueprint); in-progress
  // lint in one shouldn't block deploying the other. TypeScript type-checking still
  // runs and must pass. Revisit once both streams are lint-clean.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
