import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FloatingElements } from "@/components/landing/FloatingElements";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingElements />
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default LandingPage;
