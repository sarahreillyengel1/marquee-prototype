import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/build-preview", "/dashboard", "/analytics", "/settings", "/business/opportunities", "/opportunities/post", "/join/welcome"] }],
    sitemap: "https://marquee.bio/sitemap.xml",
  };
}
