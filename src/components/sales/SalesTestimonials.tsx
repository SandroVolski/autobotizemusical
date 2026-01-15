import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Quote, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "Reduzi 70% do tempo gasto com tarefas administrativas. Agora posso focar no que realmente importa: ensinar música. O Autobotize mudou completamente a forma como gerencio minha escola.",
    author: "Maria Silva",
    role: "Diretora, Conservatório Musical SP",
    avatar: "MS",
    rating: 5,
  },
  {
    quote: "A IA pedagógica é incrível! Sugere repertórios personalizados que meus alunos adoram e evoluem muito mais rápido. Nunca vi uma ferramenta tão inteligente para educação musical.",
    author: "Carlos Santos",
    role: "Professor de Piano",
    avatar: "CS",
    rating: 5,
  },
  {
    quote: "Zeramos a inadimplência com as cobranças automáticas e lembretes. O controle financeiro é impecável e me dá total visibilidade sobre a saúde financeira da escola.",
    author: "Ana Oliveira",
    role: "Gestora Financeira, Escola Harmonia",
    avatar: "AO",
    rating: 5,
  },
];

export const SalesTestimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Header animation
    gsap.from(headerRef.current, {
      opacity: 0,
      y: 60,
      filter: "blur(15px)",
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      },
    });

    // Cards horizontal reveal
    const cards = cardsRef.current?.querySelectorAll(".testimonial-card");
    if (cards) {
      cards.forEach((card, index) => {
        const direction = index === 0 ? -1 : index === 2 ? 1 : 0;
        gsap.from(card, {
          opacity: 0,
          x: direction * 100,
          y: direction === 0 ? 50 : 0,
          scale: 0.9,
          filter: "blur(10px)",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
            end: "top 40%",
            scrub: 1,
          },
        });
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
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Depoimentos
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            O que nossos clientes{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              dizem
            </span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="testimonial-card relative p-8 rounded-3xl bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 group"
            >
              {/* Quote icon */}
              <Quote className="w-12 h-12 text-primary/20 mb-6 group-hover:text-primary/40 transition-colors" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-relaxed mb-8">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
