import Features from "@/components/Features";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import TopCreators from "@/components/TopCreators";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { BentoGrid } from "@/components/ui/bento-grid";

export default function Home() {
  return (
    <main className="max-w-dvw overflow-x-hidden">
      <Hero />
      <TopCreators />
      <Stats />
      <Features />
      <HowItWorks />
      <FAQ />
      <Footer />
    </main>
  );
}
