import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/student-portal/",
        "/growth-network/portal/",
        "/api/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: "https://techskillhub.online/sitemap.xml",
  };
}
