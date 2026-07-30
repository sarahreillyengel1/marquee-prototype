/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse v1 has a quirk where webpack-bundling it triggers a test-file
  // read at module init that fails in serverless environments. Marking it
  // external tells Next.js to load it via Node's regular require at runtime.
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  // Retired standalone marketing pages — the v7 homepage covers these on-page.
  async redirects() {
    return [
      { source: "/product", destination: "/#what", permanent: true },
      { source: "/pricing", destination: "/#pricing", permanent: true },
      { source: "/resources", destination: "/#faq", permanent: true },
      { source: "/assessment", destination: "/#blueprint", permanent: true },
    ];
  },
};

export default nextConfig;
