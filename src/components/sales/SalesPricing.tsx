import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_NUMBER = "5542998005326";

const plans = [
  {
    name: "Starter",
    price: "97",
    description: "Para escolas iniciando sua jornada digital",
    features: [
      "Até 50 alunos",
      "Agenda e controle de presença",
      "Gestão financeira básica",
      "1 usuário administrador",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "197",
    description: "Para escolas em crescimento",
    features: [
      "Até 200 alunos",
      "Tudo do Starter +",
      "IA pedagógica completa",
      "Relatórios avançados",
      "5 usuários",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "397",
    description: "Para redes e grandes escolas",
    features: [
      "Alunos ilimitados",
      "Tudo do Professional +",
      "Multi-unidades",
      "API personalizada",
      "Usuários ilimitados",
      "Gerente de sucesso dedicado",
    ],
    popular: false,
  },
];

const getWhatsAppLink = (planName: string) => {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no plano ${planName} do Autobotize. Gostaria de mais informações!`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};

export const SalesPricing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Header animation - toggleActions para manter visível
    gsap.from(headerRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    // Cards scale up animation - toggleActions para manter visível
    const cards = cardsRef.current?.querySelectorAll(".pricing-card");
    if (cards) {
      gsap.from(cards, {
        opacity: 0,
        y: 60,
        scale: 0.9,
        stagger: 0.15,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[200px]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Preços
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Escolha o plano{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ideal
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente por 14 dias. Sem cartão de crédito.
          </p>
        </div>

        {/* Pricing Cards */}
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card relative p-8 rounded-3xl transition-all duration-500 hover:scale-105 ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/20 via-card to-card border-2 border-primary shadow-2xl shadow-primary/20 md:scale-105"
                  : "bg-card/80 border border-border hover:border-primary/30"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Mais Popular
                  </div>
                </div>
              )}

              {/* Plan info */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-primary" : "bg-primary/20"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                asChild
                className={`w-full py-6 text-lg ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
                variant={plan.popular ? "default" : "ghost"}
              >
                <a 
                  href={getWhatsAppLink(plan.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Começar Agora
                </a>
              </Button>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <p className="text-center text-muted-foreground mt-12">
          ✓ 14 dias grátis &nbsp;•&nbsp; ✓ Sem cartão de crédito &nbsp;•&nbsp; ✓ Cancele quando quiser
        </p>
      </div>
    </section>
  );
};
