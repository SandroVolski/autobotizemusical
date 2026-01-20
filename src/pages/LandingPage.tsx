import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LogoCloud } from "@/components/landing/LogoCloud";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { Footer } from "@/components/landing/Footer";
import { FloatingElements } from "@/components/landing/FloatingElements";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <LogoCloud />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
