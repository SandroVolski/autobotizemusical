import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SalesHero } from "@/components/sales/SalesHero";
import { SalesProblem } from "@/components/sales/SalesProblem";
import { SalesSolution } from "@/components/sales/SalesSolution";
import { SalesFeatures } from "@/components/sales/SalesFeatures";
import { SalesTestimonials } from "@/components/sales/SalesTestimonials";
import { SalesPricing } from "@/components/sales/SalesPricing";
import { SalesCTA } from "@/components/sales/SalesCTA";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SalesLandingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth";
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <SalesHero />
      <SalesProblem />
      <SalesSolution />
      <SalesFeatures />
      <SalesTestimonials />
      <SalesPricing />
      <SalesCTA />
      <Footer />
    </div>
  );
};

export default SalesLandingPage;
