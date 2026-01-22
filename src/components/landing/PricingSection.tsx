import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckIcon, SparklesIcon, ZapIcon, MessageIcon } from "./icons/LandingIcons";

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_NUMBER = "5542998005326";

const pricing = {
  mensal: {
    price: "197",
    period: "/mês",
    mainColor: "#8000FF",
    contrastColor: "#00F69C"
  },
  anual: {
    price: "1.970",
    period: "/ano",
    mainColor: "#00F69C",
    contrastColor: "#8000FF"
  }
};

export const PricingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const [isPricingHovered, setIsPricingHovered] = useState(false);

  const active = pricing[billingCycle];

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from("#pricing-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 95%",
        },
        opacity: 0,
        y: 60,
        duration: 1.4,
        ease: "power4.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleWhatsApp = () => {
    const cycleLabel = billingCycle === 'mensal' ? 'Mensal' : 'Anual';
    const message = `Olá! Gostaria de saber mais sobre os planos do Autobotize - Gestão Musical. Tenho interesse no plano Professional (${cycleLabel}).`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <section ref={sectionRef} id="pricing-section" className="relative py-32 bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[1000px] h-[1000px] -left-1/4 -top-1/4 rounded-full bg-[#8000FF]/5 blur-[200px]" />
        <div className="absolute w-[800px] h-[800px] -right-1/4 -bottom-1/4 rounded-full bg-[#00F69C]/5 blur-[200px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#8000FF] font-black text-[10px] uppercase tracking-[0.8em] opacity-70 block mb-4">
            Investimento
          </span>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none whitespace-pre-line">
            Tudo o que sua escola{'\n'}precisa em um único lugar
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <span className={`text-sm font-bold transition-colors ${billingCycle === 'mensal' ? 'text-white' : 'text-white/40'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'mensal' ? 'anual' : 'mensal')}
              className="relative w-16 h-8 rounded-full bg-white/5 border border-white/10 p-1"
            >
              <div
                className="absolute top-1 w-6 h-6 rounded-full transition-all duration-300"
                style={{
                  left: billingCycle === 'anual' ? 'calc(100% - 28px)' : '4px',
                  backgroundColor: active.mainColor
                }}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold transition-colors ${billingCycle === 'anual' ? 'text-white' : 'text-white/40'}`}>
                Anual
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-[#00F69C]/20 text-[#00F69C]">
                Economize 20%
              </span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="flex justify-center">
          <div
            id="pricing-card"
            className="group relative w-full max-w-lg p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm neon-border-hover"
            style={{
              ['--active-main-color' as string]: active.mainColor,
              ['--active-contrast-color' as string]: active.contrastColor
            }}
          >
            <div className="glass-shimmer" />

            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{ borderColor: `${active.mainColor}50`, backgroundColor: `${active.mainColor}10` }}
              >
                <SparklesIcon className="w-4 h-4" style={{ color: active.mainColor }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: active.mainColor }}>
                  Professional
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mt-4 mb-6">
              <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-2">
                Autobotize Pro
              </h3>
              <p className="text-white/50 text-sm max-w-xs mx-auto">
                Acesso total e ilimitado a todas as ferramentas de automação, gestão e IA que você já conheceu.
              </p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-white text-6xl font-black" style={{ color: active.mainColor }}>
                  R${active.price}
                </span>
                <span className="text-white/50 text-lg font-medium mb-2">
                  {active.period}
                </span>
              </div>
              <p className="text-white/30 text-xs uppercase tracking-wider">
                Matrículas e Alunos Ilimitados
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleWhatsApp}
              onMouseEnter={() => setIsPricingHovered(true)}
              onMouseLeave={() => setIsPricingHovered(false)}
              className="group/btn relative w-full h-20 rounded-2xl font-black text-xl overflow-hidden transition-all duration-500 shadow-2xl active:scale-95 z-10"
              style={{ boxShadow: `0 20px 40px ${active.mainColor}33` }}
            >
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${active.mainColor}, ${active.contrastColor})`,
                  opacity: isPricingHovered ? 0 : 1
                }}
              />
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${active.contrastColor}, ${active.mainColor})`,
                  opacity: isPricingHovered ? 1 : 0
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-3 text-white">
                Começar agora
                <span
                  className="text-sm font-medium transition-all duration-300"
                  style={{ opacity: isPricingHovered ? 1 : 0, transform: isPricingHovered ? 'translateX(0)' : 'translateX(-10px)' }}
                >
                  Ótima Escolha!
                </span>
              </span>
            </button>

            {/* Trial Badge */}
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wider">
                <CheckIcon className="w-4 h-4 text-[#00F69C]" />
                3 Dias Grátis
              </span>
            </div>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-2">
            <span className="text-white/30 text-xs uppercase tracking-wider">
              Dúvidas?
            </span>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre os planos do Autobotize.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#00F69C] hover:text-white transition-colors"
            >
              <MessageIcon className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wider">
                Fale com um especialista
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
