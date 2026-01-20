import React, { useEffect, useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import espiralGif from '@/assets/espiral.gif';

gsap.registerPlugin(ScrollTrigger);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const PricingCTASection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const ctaContentRef = useRef<HTMLDivElement>(null);

  const WHATSAPP_NUMBER = "5542998005326";
  const SUPPORT_LINK = "https://api.whatsapp.com/send/?phone=5542998005326&text=Ol%C3%A1%21+Gostaria+de+saber+mais+sobre+os+planos+do+Autobotize+-+Gest%C3%A3o+Musical.+Tenho+interesse+no+plano+Professional.&type=phone_number&app_absent=0";

  const pricing = {
    mensal: { price: "197", period: "/mês", label: "Mensal" },
    anual: { price: "1.970", period: "/ano", label: "Anual" }
  };

  useGSAP(() => {
    if (!triggerRef.current || !ctaContentRef.current || !imageRef.current) return;

    gsap.from(ctaContentRef.current.children, {
      opacity: 0,
      y: 20,
      duration: 1,
      stagger: 0.15,
      ease: "expo.out",
      scrollTrigger: {
        trigger: ctaContentRef.current,
        start: "top 80%",
      }
    });

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

    gsap.from("#pricing-card", {
      scrollTrigger: {
        trigger: "#pricing-section",
        start: "top 80%",
      },
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: "power4.out"
    });
  }, { scope: containerRef });

  const handleWhatsApp = () => {
    const cycleLabel = billingCycle === 'mensal' ? 'Mensal' : 'Anual';
    const message = `Olá! Gostaria de saber mais sobre os planos do Autobotize - Gestão Musical. Tenho interesse no plano Professional (${cycleLabel}).`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div ref={containerRef} className="bg-black text-white">
      <style>{`
        @keyframes shimmer-btn {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shimmer-btn {
          animation: shimmer-btn 2s infinite;
        }

        @keyframes neon-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); filter: blur(80px); }
          50% { opacity: 0.6; transform: scale(1.05); filter: blur(100px); }
        }

        .animate-neon-pulse {
          animation: neon-pulse 4s ease-in-out infinite;
        }
        
        .neon-glow-impact {
          border-color: rgba(128, 0, 255, 0.6) !important;
          background: linear-gradient(145deg, #080808 0%, #000000 100%) !important;
          box-shadow: 
            0 0 80px -5px rgba(128, 0, 255, 0.8),
            0 0 160px 20px rgba(0, 246, 156, 0.35);
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
      `}</style>

      {/* SEÇÃO 1: HERO */}
      <section className="relative overflow-hidden min-h-[50vh] pt-16 md:pt-24 pb-0 flex flex-col items-center font-sans">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black via-black/80 to-transparent z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(128,0,255,0.12),transparent_70%)] z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,246,156,0.04),transparent_50%)] z-0" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black via-black/80 to-transparent z-0 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div ref={ctaContentRef} className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="relative group mb-8 cursor-default">
              <div className="absolute -inset-px bg-gradient-to-r from-[#00F69C]/40 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#00F69C]/10 border border-[#00F69C]/20">
                  <ZapIcon className="w-3 h-3 text-[#00F69C]" />
                </div>
                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/90">
                  3 dias grátis <span className="mx-2 text-white/20">|</span> 
                  <span className="text-white/60 font-medium tracking-[0.15em]">Sem compromisso</span>
                </span>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight uppercase text-white drop-shadow-sm">
              Pronto para transformar sua{" "}
              <span className="text-[#00F69C] relative inline-block">
                escola de música
                <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00F69C]/40 to-transparent" />
              </span>?
            </h2>

            <p className="text-base md:text-lg text-white/70 mb-6 max-w-2xl mx-auto leading-relaxed font-normal">
              Junte-se a centenas de escolas que já automatizaram sua gestão e 
              potencializaram o aprendizado dos alunos com nossa plataforma.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: ESPIRAL */}
      <section ref={triggerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
        <div className="relative z-0 flex items-center justify-center w-full h-full">
          <img
            ref={imageRef}
            src={espiralGif}
            alt="Espiral"
            className="w-48 h-48 md:w-80 md:h-80 object-contain rounded-full"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_85%)] z-10 pointer-events-none" />
      </section>

      {/* SEÇÃO 3: PREÇOS */}
      <section id="pricing-section" className="relative py-32 bg-black min-h-screen flex flex-col items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(128,0,255,0.06),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,246,156,0.03),transparent_60%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#8000FF] font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Investimento</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-10 tracking-tight uppercase leading-none">
              Tudo o que sua escola <br /> precisa em um <span className="text-[#8000FF]">único lugar</span>
            </h2>

            {/* Selector de Faturamento */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className={`text-sm font-bold uppercase tracking-widest transition-opacity ${billingCycle === 'mensal' ? 'text-white' : 'text-white/40'}`}>Mensal</span>
              <button 
                onClick={() => setBillingCycle(prev => prev === 'mensal' ? 'anual' : 'mensal')}
                className="relative w-16 h-8 rounded-full bg-white/5 border border-white/10 p-1 transition-all duration-300 hover:border-[#8000FF]/50"
              >
                <div className={`w-6 h-6 rounded-full bg-[#8000FF] shadow-[0_0_15px_rgba(128,0,255,0.5)] transition-transform duration-300 transform ${billingCycle === 'anual' ? 'translate-x-8' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold uppercase tracking-widest transition-opacity ${billingCycle === 'anual' ? 'text-white' : 'text-white/40'}`}>Anual</span>
                <span className="bg-[#00F69C]/10 text-[#00F69C] text-[9px] font-black px-2 py-1 rounded-md border border-[#00F69C]/20 uppercase tracking-tighter">
                  Economize 20%
                </span>
              </div>
            </div>
          </div>

          <div id="pricing-card" className="max-w-lg mx-auto relative group">
            <div className="absolute -inset-20 bg-gradient-to-b from-[#8000FF]/70 via-[#8000FF]/20 to-transparent rounded-[5rem] blur-[110px] opacity-30 group-hover:opacity-100 transition duration-1000 animate-neon-pulse pointer-events-none" />
            
            <div className="relative bg-[#050505] border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-2xl backdrop-blur-sm transition-all duration-700 hover:scale-[1.03] overflow-hidden text-center group-hover:neon-glow-impact">
              <div className="glass-shimmer pointer-events-none" />
              
              <div className="absolute -top-1 right-12 z-20">
                <div className="bg-[#8000FF] text-white text-[11px] font-black uppercase px-5 py-2.5 rounded-b-2xl flex items-center gap-1.5 shadow-xl shadow-[#8000FF]/30">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Professional
                </div>
              </div>

              <div className="mb-12 mt-4 relative z-10">
                <h3 className="text-4xl font-black mb-4 uppercase tracking-tight">Autobotize Pro</h3>
                <p className="text-gray-400 text-base leading-relaxed max-w-xs mx-auto">
                  Acesso total e ilimitado a todas as ferramentas de automação, gestão e IA que você já conheceu.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center mb-12 relative z-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-7xl md:text-8xl font-black tracking-tighter text-[#8000FF] transition-transform duration-500 group-hover:scale-105 inline-block">
                    R${pricing[billingCycle].price}
                  </span>
                  <span className="text-gray-500 font-bold text-lg">{pricing[billingCycle].period}</span>
                </div>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-[#00F69C]/10 border border-[#00F69C]/20 text-[#00F69C] text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,246,156,0.2)] group-hover:shadow-[0_0_30px_rgba(0,246,156,0.4)] transition-all duration-500">
                  Matrículas e Alunos Ilimitados
                </div>
              </div>

              <button
                onClick={handleWhatsApp}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group/btn relative w-full h-20 rounded-2xl font-black text-xl overflow-hidden transition-all duration-300 shadow-2xl shadow-[#8000FF]/30 active:scale-95 z-10"
              >
                <div className={`absolute inset-0 transition-colors duration-500 ${isHovered ? 'bg-white' : 'bg-[#8000FF]'}`} />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer-btn" />
                
                <div className="relative h-full w-full flex items-center justify-center">
                  <span className={`absolute transition-all duration-500 uppercase tracking-widest ${isHovered ? 'opacity-0 -translate-y-6' : 'opacity-100 translate-y-0 text-white'}`}>
                    Começar agora
                  </span>
                  <span className={`absolute transition-all duration-500 flex items-center gap-3 uppercase tracking-widest ${isHovered ? 'opacity-100 translate-y-0 text-[#8000FF]' : 'opacity-0 translate-y-6'}`}>
                    <CheckIcon className="w-6 h-6" />
                    Ótima Escolha!
                  </span>
                </div>
              </button>
              
              <div className="mt-10 pt-8 border-t border-white/5 relative z-10">
                <div className="flex items-center justify-center gap-6 opacity-70">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#00F69C] drop-shadow-[0_0_10px_rgba(0,246,156,0.5)]">3 Dias Grátis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Dúvidas */}
          <div className="mt-12 text-center animate-fade-in">
            <div className="inline-flex flex-col md:flex-row items-center gap-2 md:gap-4 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] hover:border-[#00F69C]/20 group">
              <span className="text-gray-400 text-sm font-medium tracking-tight">Dúvidas?</span>
              <a 
                href={SUPPORT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white font-bold text-sm md:text-base tracking-tight hover:text-[#00F69C] transition-colors duration-300"
              >
                <MessageIcon className="w-5 h-5 text-[#00F69C] group-hover:scale-110 transition-transform duration-300" />
                Fale com um especialista
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <div className="h-[20vh] bg-black" />
    </div>
  );
};

export default PricingCTASection;
