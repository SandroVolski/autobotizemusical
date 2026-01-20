import { ScrollRevealText } from "./ScrollRevealText";
import { LaptopFeaturesSection } from "./LaptopFeaturesSection";

export const FeaturesSection = () => {
  return (
    <section id="recursos" className="relative">
      <div className="py-24">
        <div className="container mx-auto px-4">
          {/* Scroll Reveal Text Section */}
          <ScrollRevealText />
        </div>
      </div>

      {/* Laptop Features Animation */}
      <LaptopFeaturesSection />
    </section>
  );
};
