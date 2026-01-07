import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description: "Para escolas iniciando sua jornada digital",
    price: "97",
    period: "/mês",
    features: [
      "Até 50 alunos",
      "1 usuário administrador",
      "Gestão de matrículas",
      "Agenda básica",
      "Controle financeiro",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Professional",
    description: "Para escolas em crescimento",
    price: "197",
    period: "/mês",
    features: [
      "Até 200 alunos",
      "5 usuários",
      "Tudo do Starter",
      "IA Pedagógica",
      "Relatórios avançados",
      "Material didático digital",
      "Integrações",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Para redes e grandes escolas",
    price: "497",
    period: "/mês",
    features: [
      "Alunos ilimitados",
      "Usuários ilimitados",
      "Tudo do Professional",
      "Multi-unidades",
      "API completa",
      "Customizações",
      "Gerente de conta dedicado",
      "SLA garantido",
    ],
    popular: false,
  },
];

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="precos" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(270,100%,50%,0.05),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Preços
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Planos que cabem no seu{" "}
            <span className="gradient-text">orçamento</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua escola. 
            Todos incluem 14 dias grátis para testar.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={plan.popular ? "md:-mt-4 md:mb-4" : ""}
            >
              <Card className={`h-full relative ${plan.popular ? "border-primary glow-primary" : "glass"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4 pt-8">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">R${plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full ${plan.popular ? "" : "variant-outline"}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate("/login")}
                  >
                    Começar agora
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
