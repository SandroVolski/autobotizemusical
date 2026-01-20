import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import spiralImage from "@/assets/espiral.gif";

export const SpiralCTASection = () => {
  const [libsLoaded, setLibsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const ctaContentRef = useRef<HTMLDivElement>(null);

  // Carregamento dinâmico do GSAP e ScrollTrigger
  useEffect(() => {
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const loadAll = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js');
        setLibsLoaded(true);
      } catch (err) {
        console.error("Erro ao carregar GSAP:", err);
      }
    };

    loadAll();
  }, []);

  useEffect(() => {
    if (!libsLoaded || !triggerRef.current) return;

    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;
    
    if (!gsap || !ScrollTrigger) return;
    
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animação de entrada do conteúdo
      if (ctaContentRef.current) {
        gsap.from(ctaContentRef.current.children, {
          opacity: 0,
          y: 20,
          duration: 1,
          stagger: 0.15,
          ease: "expo.out"
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
          markers: false,
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
    <div ref={containerRef} className="relative bg-black">
      {/* Seção 1: CTASection */}
      <section className="relative py-32 sm:py-40 bg-black overflow-hidden">
        {/* Fade Superior */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-background via-background/80 to-transparent z-10 pointer-events-none" />

        {/* Efeitos de Fundo Misturados */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(128,0,255,0.08)_0%,transparent_70%)] blur-3xl opacity-50 animate-pulse" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Fade Inferior */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-20">
          <div ref={ctaContentRef} className="text-center max-w-4xl mx-auto space-y-8">
            {/* Tag Profissional: "3 dias grátis" com Shimmer e Glassmorphism */}
            <div className="relative inline-flex justify-center group cursor-default">
              {/* Brilho externo sutil que aparece no hover */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#8B5CF6]/30 to-[#00D084]/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden">
                {/* Efeito de Brilho (Shimmer) que atravessa a tag periodicamente */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div
                    className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                    style={{ animation: "shimmer 3s ease-in-out infinite" }}
                  />
                </div>

                {/* Ícone dentro de um círculo com glow */}
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
                {/* Linha decorativa sutil abaixo do destaque */}
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
      <div ref={triggerRef} className="relative h-screen w-full bg-black overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            ref={imageRef}
            src={spiralImage}
            alt="Espiral animada"
            className="w-[60vmin] h-[60vmin] object-contain will-change-transform select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh3ZmxyeXJ3ZmxyeXJ3ZmxyeXJ3ZmxyeXJ3ZmxyeXJ3JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS06DclhS/giphy.gif";
            }}
          />
        </div>

        {/* Vinheta profunda focada no centro */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.7)_70%,rgba(0,0,0,1)_100%)]" />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
        `
      }} />
    </div>
  );
};
