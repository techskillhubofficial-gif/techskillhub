import type { MetadataRoute } from "next";

const BASE_URL = "https://techskillhub.online";

const PROGRAM_SLUGS = [
  "codeforge",
  "insightiq",
  "designsphere",
  "growthx",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const publicRoutes = [
    "",
    "/about",
    "/programs",
    "/contact",
    "/consultation",
    "/connect",
    "/growth-network/join",
  ];

  return [
    ...publicRoutes.map((route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...PROGRAM_SLUGS.map((slug) => ({
      url: `${BASE_URL}/programs/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
