import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FloatingElements } from "@/components/landing/FloatingElements";
import { RevealSection } from "@/components/landing/RevealSection";
import { NotebookFeaturesSection } from "@/components/landing/NotebookFeaturesSection";
import { MusicalTransition } from "@/components/landing/MusicalTransition";
import { SocialProofSphere } from "@/components/landing/SocialProofSphere";
import { SpiralCTASection } from "@/components/landing/SpiralCTASection";
import { PricingSection } from "@/components/landing/PricingSection";
import { NewFooter } from "@/components/landing/NewFooter";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black relative montserrat-font">
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <RevealSection />
      <NotebookFeaturesSection />
      <MusicalTransition />
      <SocialProofSphere />
      <SpiralCTASection />
      <PricingSection />
      <NewFooter />
    </div>
  );
};

export default LandingPage;
