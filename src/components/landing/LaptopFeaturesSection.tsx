import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Gestão de Alunos",
    desc: "Registo completo, histórico de matrículas, progresso individual e comunicação direta.",
    img: "https://images.unsplash.com/photo-1577891776198-c28c302f0b1a?auto=format&fit=crop&w=800&q=80",
    bgText: "GESTÃO"
  },
  {
    title: "Agenda Inteligente",
    desc: "Agendamento automático, controlo de presença e sincronização com calendários externos.",
    img: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80",
    bgText: "ESCOLA"
  },
  {
    title: "Controle Financeiro",
    desc: "Mensalidades, cobranças automáticas, relatórios de incumprimento e projeções.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    bgText: "FINANÇAS"
  },
  {
    title: "IA Pedagógica",
    desc: "Sugestões de repertório, planos de aula personalizados e análise de evolução.",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    bgText: "AUTOBOTIZE"
  },
  {
    title: "Material Didático",
    desc: "Biblioteca digital, pautas, vídeo-aulas e recursos partilhados.",
    img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80",
    bgText: "MÚSICA"
  },
  {
    title: "Comunicação",
    desc: "Avisos automáticos, lembretes de aulas e notificações personalizadas.",
    img: "https://images.unsplash.com/photo-1577563906417-45a11b3f9f7c?auto=format&fit=crop&w=800&q=80",
    bgText: "CONEXÃO"
  },
  {
    title: "Relatórios Avançados",
    desc: "Dashboards em tempo real, métricas de desempenho e insights acionáveis.",
    img: "https://images.unsplash.com/photo-1551288049-bbbda536ad0a?auto=format&fit=crop&w=800&q=80",
    bgText: "DADOS"
  },
  {
    title: "Multi-instrumentos",
    desc: "Suporte para todos os instrumentos com configurações específicas para cada um.",
    img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
    bgText: "SISTEMA"
  }
];

export const LaptopFeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !horizontalRef.current || !lidRef.current) return;

    const totalFeatures = features.length;
    
    const openDur = 1.5;
    const scrollDur = totalFeatures * 1.2;
    const closeDur = 1.5;
    const totalDur = openDur + scrollDur + closeDur;

    const snapPoints: number[] = [];
    snapPoints.push(0);
    snapPoints.push(openDur / totalDur);
    
    for (let i = 1; i < totalFeatures; i++) {
      const step = (scrollDur / (totalFeatures - 1)) * i;
      snapPoints.push((openDur + step) / totalDur);
    }
    
    snapPoints.push(1);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        start: "top top",
        end: () => `+=${window.innerHeight * totalDur * 2.5}`,
        scrub: 2,
        invalidateOnRefresh: true,
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.4, max: 0.8 },
          delay: 0.2,
          ease: "power2.inOut"
        },
        onUpdate: (self) => {
          const p = self.progress;
          const openThreshold = openDur / totalDur;
          const closeThreshold = (openDur + scrollDur) / totalDur;

          if (p < openThreshold) {
            setActiveIndex(0);
          } else if (p > closeThreshold) {
            setActiveIndex(totalFeatures - 1);
          } else {
            const normalized = (p - openThreshold) / (scrollDur / totalDur);
            const index = Math.max(0, Math.min(Math.round(normalized * (totalFeatures - 1)), totalFeatures - 1));
            setActiveIndex(index);
          }
        }
      }
    });

    tl.fromTo(lidRef.current, 
      { rotateX: -95 }, 
      { rotateX: 0, duration: openDur, ease: "sine.inOut" }
    );

    tl.to(horizontalRef.current, {
      x: () => -(horizontalRef.current!.scrollWidth - window.innerWidth),
      ease: "none",
      duration: scrollDur
    });

    tl.to(lidRef.current, {
      rotateX: -95,
      duration: closeDur,
      ease: "sine.inOut"
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section id="recursos" className="bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground antialiased overflow-x-hidden">
      <div ref={containerRef} className="relative h-screen overflow-hidden bg-background">
        
        {/* Rótulo Superior */}
        <div className="absolute top-[5vh] left-0 w-full z-40 pointer-events-none flex justify-center">
          <span className="text-primary font-black tracking-[0.6em] uppercase text-[10px] sm:text-[12px] opacity-80 block text-center">
            Funcionalidades
          </span>
        </div>

        {/* Portátil Centralizado */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-4">
          <div className="relative w-full max-w-[320px] sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col items-center" style={{ perspective: '2000px' }}>
            
            <div 
              ref={lidRef}
              className="relative w-full bg-gradient-to-b from-zinc-300 to-zinc-500 p-[2px] sm:p-[4px] rounded-t-xl sm:rounded-t-2xl shadow-[0_0_120px_rgba(139,92,246,0.08)] border border-white/5 will-change-transform z-10"
              style={{ 
                transformOrigin: 'bottom',
                transform: 'rotateX(-95deg)',
                backfaceVisibility: 'hidden'
              }}
            >
              <div className="relative bg-[#050505] rounded-lg sm:rounded-xl overflow-hidden aspect-video border-[4px] sm:border-[8px] md:border-[12px] border-[#0a0a0a]">
                {features.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${activeIndex === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                  >
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 pointer-events-none"></div>
              </div>
              <div className="absolute top-[4px] sm:top-[8px] left-1/2 -translate-x-1/2 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-zinc-900 rounded-full border border-zinc-800"></div>
            </div>

            <div className="relative w-[112%] h-4 sm:h-8 -mt-[1px] z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-400 to-zinc-700 rounded-b-lg sm:rounded-b-3xl shadow-2xl border-t border-zinc-300/40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-32 h-1.5 sm:h-2.5 bg-zinc-800/20 rounded-b-md border-x border-b border-zinc-500/10"></div>
              </div>
              <div className="absolute -bottom-3 sm:-bottom-6 left-1/2 -translate-x-1/2 w-[96%] h-6 sm:h-10 bg-black/90 blur-xl sm:blur-3xl rounded-full opacity-70"></div>
            </div>
          </div>
        </div>

        {/* Indicadores Visuais de Progresso */}
        <div className="absolute bottom-8 left-0 w-full z-40 pointer-events-none">
          <div className="flex justify-center items-center gap-3">
            {features.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-700 ${activeIndex === i ? 'w-16 bg-primary shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'w-3 bg-muted'}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Painéis Horizontais */}
        <div 
          ref={horizontalRef} 
          className="flex h-full will-change-transform relative z-20"
          style={{ width: `${features.length * 100}vw` }}
        >
          {features.map((item, index) => (
            <div 
              key={index} 
              className="w-screen h-full flex flex-col items-center flex-shrink-0 relative overflow-hidden"
            >
              {/* Área do Título */}
              <div className="h-[30vh] w-full flex flex-col items-center justify-center px-4">
                <div className={`transition-all duration-1000 ease-out ${activeIndex === index ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95'}`}>
                  <h3 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter uppercase italic leading-none drop-shadow-2xl text-center whitespace-nowrap bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="h-[40vh] w-full pointer-events-none"></div>

              {/* Descrição Inferior */}
              <div className="h-[30vh] w-full flex flex-col items-center justify-center px-8">
                <div className={`transition-all duration-1000 delay-200 ease-out ${activeIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-xl lg:text-2xl leading-relaxed font-medium max-w-3xl text-center drop-shadow-lg px-4">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Texto de Fundo (GIGANTE e VAZADO) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <h4 
                  className="text-[25vw] font-black uppercase leading-none transform -rotate-12 transition-all duration-1000 text-transparent"
                  style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.08)' }}
                >
                  {item.bgText}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
