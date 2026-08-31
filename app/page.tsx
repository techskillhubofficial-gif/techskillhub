import { CTA } from "@/components/home/CTA";
import { CareerPaths } from "@/components/home/CareerPaths";
import { FAQ } from "@/components/home/FAQ";
import { Hero } from "@/components/home/Hero";
import { LearningProcess } from "@/components/home/LearningProcess";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyTechSkillHub } from "@/components/home/WhyTechSkillHub";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WhyTechSkillHub />
        <CareerPaths />
        <LearningProcess />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
