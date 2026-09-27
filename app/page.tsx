import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { Hero } from "@/components/home/Hero";
import { CareerPaths } from "@/components/home/CareerPaths";
import { PremiumLearningShowcase } from "@/components/home/PremiumLearningShowcase";
import { Audience } from "@/components/home/Audience";
import { WhyTechSkillHub } from "@/components/home/WhyTechSkillHub";
import { LearningProcess } from "@/components/home/LearningProcess";
import VisualShowcase from "@/components/home/VisualShowcase";
import Projects from "@/components/home/Projects";
import PortfolioShowcase from "@/components/home/PortfolioShowcase";
import { PlatformExperience } from "@/components/home/PlatformExperience";
import { Founder } from "@/components/home/Founder";
import { Consultation } from "@/components/home/Consultation";
import { FAQ } from "@/components/home/FAQ";
import { HomeMotion } from "@/components/home/HomeMotion";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex min-h-screen flex-col overflow-x-hidden bg-white">
        <HomeMotion />
        <Hero />

        <WhyTechSkillHub />

        <CareerPaths />

        <PremiumLearningShowcase />

        <VisualShowcase />
        <Projects />
        <PortfolioShowcase />

        <Audience />

        <LearningProcess />

        <PlatformExperience />


        <Consultation />

        <Founder />

        <FAQ />
      </main>

      <Footer />
    </>
  );
}
