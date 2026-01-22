import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
    bgText: "INTELIGÊNCIA"
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

export const NotebookFeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !horizontalRef.current || !lidRef.current) return;

    const totalFeatures = features.length;
    const openDur = 1;
    const scrollDur = totalFeatures * 2.5;
    const closeDur = 1;
    const totalDur = openDur + scrollDur + closeDur;

    const snapPoints = [0];
    snapPoints.push(openDur / totalDur);
    for (let i = 1; i < totalFeatures; i++) {
      const step = (scrollDur / (totalFeatures - 1)) * i;
      snapPoints.push((openDur + step) / totalDur);
    }
    snapPoints.push(1);

    const ctx = gsap.context(() => {
      const notebookTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          start: "top top",
          end: () => `+=${window.innerHeight * totalFeatures * 1.5}`,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: (value) => {
              const closest = snapPoints.reduce((prev, curr) =>
                Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
              );
              return closest;
            },
            duration: { min: 0.2, max: 0.6 },
            delay: 0.05,
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

      notebookTl.fromTo(lidRef.current, { rotateX: -95 }, { rotateX: 0, duration: openDur, ease: "none" });
      notebookTl.to(horizontalRef.current, {
        x: () => -(horizontalRef.current!.scrollWidth - window.innerWidth),
        ease: "none",
        duration: scrollDur
      });
      notebookTl.to(lidRef.current, { rotateX: -95, duration: closeDur, ease: "none" });

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen bg-black overflow-hidden">
      {/* Label */}
      <div className="fixed top-24 left-0 right-0 flex justify-center z-[200] pointer-events-none">
        <span className="text-[#8000FF] font-black text-[10px] md:text-xs uppercase tracking-[0.8em] opacity-50">
          Recursos Premium
        </span>
      </div>

      {/* Laptop Container */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '2000px' }}>
        <div className="relative w-[90vw] max-w-[1200px] aspect-[16/10]">
          {/* Screen (Lid) */}
          <div
            ref={lidRef}
            className="absolute inset-x-0 top-0 h-[85%] rounded-t-2xl overflow-hidden border-4 border-b-0 border-white/10 bg-gradient-to-b from-zinc-900 to-black"
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'center bottom',
              backfaceVisibility: 'hidden'
            }}
          >
            {features.map((item, idx) => (
              <div
                key={idx}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: activeIndex === idx ? 1 : 0 }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>
            ))}
          </div>

          {/* Keyboard Base */}
          <div className="absolute inset-x-0 bottom-0 h-[18%] rounded-b-xl bg-gradient-to-b from-zinc-800 to-zinc-900 border-4 border-t-0 border-white/10 flex items-center justify-center">
            <div className="w-24 h-1 rounded-full bg-white/10" />
            <div className="absolute inset-x-[10%] top-2 bottom-4 rounded bg-zinc-800/50 border border-white/5" />
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Content */}
      <div
        ref={horizontalRef}
        className="absolute top-0 left-0 h-screen flex items-center"
        style={{ width: `${features.length * 100}vw` }}
      >
        {features.map((item, index) => (
          <div
            key={index}
            className="w-screen h-screen flex items-center justify-center px-8"
          >
            <div className="relative max-w-4xl w-full flex flex-col items-center text-center">
              <div className="mb-8">
                <h3
                  className="text-white text-4xl md:text-7xl font-black uppercase tracking-tighter transition-all duration-500"
                  style={{ opacity: activeIndex === index ? 1 : 0.2 }}
                >
                  {item.title}
                </h3>
              </div>

              <div className="max-w-xl">
                <p
                  className="text-white/60 text-lg md:text-2xl font-medium leading-relaxed transition-all duration-500"
                  style={{ opacity: activeIndex === index ? 1 : 0.3 }}
                >
                  {item.desc}
                </p>
              </div>

              <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                <span
                  className="text-[20vw] font-black text-white/[0.02] uppercase tracking-tighter select-none"
                  style={{ transform: activeIndex === index ? 'scale(1)' : 'scale(0.8)', transition: 'transform 0.5s' }}
                >
                  {item.bgText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-[200]">
        <div className="flex gap-2">
          {features.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: activeIndex === i ? '32px' : '8px',
                backgroundColor: activeIndex === i ? '#8000FF' : 'rgba(255,255,255,0.2)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
