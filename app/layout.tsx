import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://techskillhub.online"),
  title: {
    default: "TechSkillHub — Building India's Future Workforce",
    template: "%s | TechSkillHub",
  },
  description:
    "TechSkillHub brings career-focused learning, practical projects and professional development together to help build India's future workforce.",
  applicationName: "TechSkillHub",
  keywords: [
    "TechSkillHub",
    "career courses",
    "skill development",
    "software engineering",
    "data analytics",
    "UI UX design",
    "business growth",
    "career devment",
  ],
  authors: [{ name: "TechSkillHub" }],
  creator: "TechSkillHub",
  publisher: "TechSkillHub",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://techskillhub.online",
    siteName: "TechSkillHub",
    title: "TechSkillHub — Building India's Future Workforce",
    description:
      "Career-focused learning, practical projects and professional development for India's future workforce.",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
