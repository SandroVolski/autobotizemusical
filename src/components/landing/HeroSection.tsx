import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Zap, Sparkles, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (!section || !video || !overlay || !content) return;

    // Initial state
    gsap.set(badgeRef.current, { opacity: 0, y: 30 });
    gsap.set(headingRef.current, { opacity: 0, y: 50 });
    gsap.set(subRef.current, { opacity: 0, y: 30 });
    gsap.set(ctaRef.current, { opacity: 0, y: 30 });
    gsap.set(socialProofRef.current, { opacity: 0, y: 20 });

    // Entrance animation timeline
    const entranceTl = gsap.timeline({ delay: 0.3 });
    
    entranceTl
      .to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      })
      .to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.4")
      .to(subRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      }, "-=0.5")
      .to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      }, "-=0.4")
      .to(socialProofRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      }, "-=0.3");

    // Pin the section and create scroll effects
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    // Video and overlay effects during scroll
    scrollTl
      .to(video, {
        scale: 1.15,
        ease: "none",
      }, 0)
      .to(overlay, {
        opacity: 0.85,
        ease: "none",
      }, 0)
      .to(content, {
        y: -80,
        opacity: 0,
        scale: 0.95,
        filter: "blur(10px)",
        ease: "power2.in",
      }, 0.3);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-100"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay with Gradient */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background/90"
      />

      {/* Additional Gradient Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background))_80%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex items-center justify-center px-4"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white">
              A plataforma #1 para escolas de música
            </span>
          </div>

          {/* Heading */}
          <h1
            ref={headingRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-[1.1] tracking-tight"
          >
            <span className="text-white drop-shadow-lg">Gestão completa para sua</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              escola de música
            </span>
          </h1>

          {/* Subheading */}
          <p
            ref={subRef}
            className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Automatize matrículas, gerencie aulas, controle finanças e potencialize
            o aprendizado com inteligência artificial.
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="xl"
              className="glow-primary group relative overflow-hidden bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300"
              onClick={() => navigate("/login")}
            >
              <Zap className="mr-2 h-5 w-5" />
              Começar gratuitamente
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="group backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Ver demonstração
            </Button>
          </div>

          {/* Social Proof */}
          <div
            ref={socialProofRef}
            className="mt-16 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Music
                  key={i}
                  className="w-5 h-5 text-secondary fill-secondary"
                />
              ))}
            </div>
            <p className="text-sm text-white/70">
              Usado por{" "}
              <span className="text-white font-semibold">+500 escolas</span> em
              todo o Brasil
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />
    </section>
  );
};
