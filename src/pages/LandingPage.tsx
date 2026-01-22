import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FloatingElements } from "@/components/landing/FloatingElements";
import { 
  RevealSection, 
  NotebookFeaturesSection, 
  SocialProofSphere, 
  MusicalTransition, 
  SpiralCTASection, 
  PricingSection, 
  NewFooter 
} from "@/components/landing/SalesComponents";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <style>{`
        .montserrat-font { font-family: 'Montserrat', sans-serif; }
        
        @keyframes shimmer-btn {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes neon-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); filter: blur(80px); }
          50% { opacity: 0.6; transform: scale(1.05); filter: blur(100px); }
        }

        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
        @keyframes marquee2 { 0% { transform: translateX(100%); } 100% { transform: translateX(0%); } }
        .animate-marquee { animation: marquee 50s linear infinite; }
        .animate-marquee2 { animation: marquee2 50s linear infinite; }
        .animate-neon-pulse { animation: neon-pulse 4s ease-in-out infinite; }

        .neon-border-hover {
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .neon-border-hover:hover {
          border-color: #8000FFCC !important;
          box-shadow: 
            0 0 20px #8000FF40,
            inset 0 0 10px #8000FF20,
            0 0 80px -5px #8000FF80,
            0 0 160px 20px #00F69C20;
          transform: scale(1.02);
        }

        .glass-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.03), transparent);
          transform: translateX(-100%);
          transition: transform 0.8s ease;
        }

        .group:hover .glass-shimmer {
          transform: translateX(100%);
        }

        .reveal-text-container {
            max-width: 1000px;
            margin: 0 auto;
            text-align: center;
        }
        .line-wrapper {
            position: relative;
            display: inline-block;
            margin-bottom: 15px;
            line-height: 1.2;
            white-space: nowrap;
        }
        .word-span {
            display: inline-block;
            color: rgba(255, 255, 255, 0.1);
            margin-right: 0.4em;
            transition: color 0.4s ease;
            position: relative;
            z-index: 5;
        }
        .word-span:last-child {
            margin-right: 0;
        }
        .line-strike {
            position: absolute;
            top: -2px;
            left: -8px;
            width: calc(100% + 16px);
            height: calc(100% + 4px);
            background-color: #8000FF;
            transform-origin: right; 
            transform: scaleX(1);
            z-index: 10;
            pointer-events: none;
            border-radius: 2px;
        }
      `}</style>
      
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <RevealSection />
      <NotebookFeaturesSection />
      <SocialProofSphere />
      <MusicalTransition />
      <SpiralCTASection />
      <PricingSection />
      <NewFooter />
    </div>
  );
};

export default LandingPage;
