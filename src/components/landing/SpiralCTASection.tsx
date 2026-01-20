import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import spiralImage from "@/assets/espiral.webp";

gsap.registerPlugin(ScrollTrigger);

export const SpiralCTASection = () => {
  const [libsLoaded, setLibsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const ctaContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLibsLoaded(true);
  }, []);

  useEffect(() => {
    if (!libsLoaded || !triggerRef.current) return;

    const ctx = gsap.context(() => {
      // Animação de entrada do conteúdo
      if (ctaContentRef.current) {
        gsap.from(ctaContentRef.current.children, {
          opacity: 0,
          y: 20,
          duration: 1,
          stagger: 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ctaContentRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });
      }

      // Efeito de Pinning e Zoom da Espiral
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1.5,
        }
      });

      tl.to(imageRef.current, {
        scale: 15,
        filter: "blur(20px)",
        opacity: 0,
        ease: "power2.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, [libsLoaded]);

  return (
    <div ref={containerRef} className="relative">
      {/* Seção 1: CTASection */}
      <section className="relative py-32 sm:py-40 bg-zinc-950 overflow-hidden">
        {/* Fade Superior */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-background via-background/80 to-transparent z-10 pointer-events-none" />

        {/* Efeitos de Fundo Misturados */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(128,0,255,0.08)_0%,transparent_70%)] blur-3xl opacity-50 animate-pulse" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Fade Inferior */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-zinc-950 to-transparent z-10 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-20">
          <div ref={ctaContentRef} className="text-center max-w-4xl mx-auto space-y-8">
            {/* Tag Profissional */}
            <div className="relative inline-flex justify-center group cursor-default">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#8B5CF6]/30 to-[#00D084]/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden">
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div 
                    className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                    style={{ animation: "shimmer 3s ease-in-out infinite" }}
                  />
                </div>
                
                <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#00D084] shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  <Zap className="w-3.5 h-3.5 text-white fill-current" />
                </div>
                
                <span className="relative z-10 text-sm font-medium text-zinc-200 tracking-wide">
                  3 dias grátis | <span className="text-zinc-400">Sem compromisso</span>
                </span>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Pronto para transformar sua{" "}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#00D084]">
                escola de música
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[#8B5CF6]/60 to-[#00D084]/60 rounded-full blur-sm" />
              </span>
              ?
            </h2>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
              Junte-se a centenas de escolas que já automatizaram sua gestão e 
              potencializaram o aprendizado dos alunos com nossa plataforma.
            </p>
          </div>
        </div>
      </section>

      {/* Seção 2: O Efeito de Pinning da Espiral */}
      <div ref={triggerRef} className="relative h-screen w-full bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            ref={imageRef}
            src={spiralImage}
            alt="Espiral animada"
            className="w-[60vmin] h-[60vmin] object-contain will-change-transform select-none"
          />
        </div>

        {/* Vinheta profunda focada no centro */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(9,9,11,0.7)_70%,rgba(9,9,11,1)_100%)]" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};
