import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ZapIcon } from "./icons/LandingIcons";
import espiral from "@/assets/espiral.webp";

gsap.registerPlugin(ScrollTrigger);

export const SpiralCTASection = () => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      const spiralTl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1
        }
      });

      spiralTl.to(imageRef.current, {
        scale: 12,
        filter: "blur(25px)",
        opacity: 0,
        ease: "power2.in"
      });
    }, triggerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={triggerRef}
      className="relative h-screen flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[800px] h-[800px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8000FF]/10 blur-[200px] animate-neon-pulse" />
        <div className="absolute w-[600px] h-[600px] left-1/4 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00F69C]/10 blur-[150px] animate-neon-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute w-[400px] h-[400px] right-1/4 bottom-1/3 translate-x-1/2 translate-y-1/2 rounded-full bg-[#8000FF]/5 blur-[100px] animate-neon-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Spiral Image */}
      <img
        ref={imageRef}
        src={espiral}
        alt="Espiral Autobotize"
        className="absolute w-[40vmin] h-[40vmin] object-contain z-10 opacity-80"
        style={{ willChange: 'transform, filter, opacity' }}
      />

      {/* Content */}
      <div ref={contentRef} className="relative z-20 text-center px-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-[#00F69C]/30 bg-[#00F69C]/5">
          <ZapIcon className="w-4 h-4 text-[#00F69C]" />
          <span className="text-[#00F69C] text-xs font-bold uppercase tracking-widest">
            3 dias grátis |
            <span className="text-white/60"> Sem compromisso</span>
          </span>
        </div>

        <h2 className="text-white text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
          Pronto para transformar sua{" "}
          <span className="relative inline-block">
            <span className="text-[#8000FF]">escola de música</span>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#8000FF] to-[#00F69C] rounded-full" />
          </span>
          ?
        </h2>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Junte-se a centenas de escolas que já automatizaram sua gestão e
          potencializaram o aprendizado dos alunos com nossa plataforma.
        </p>
      </div>
    </div>
  );
};
