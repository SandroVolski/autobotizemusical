import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LogoCloud } from "@/components/landing/LogoCloud";
import { StatsSection } from "@/components/landing/StatsSection";
import { LaptopFeaturesSection } from "@/components/landing/LaptopFeaturesSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { Footer } from "@/components/landing/Footer";
import { FloatingElements } from "@/components/landing/FloatingElements";
import { PricingCTASection } from "@/components/landing/PricingCTASection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <LogoCloud />
      <StatsSection />
      <LaptopFeaturesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingCTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
