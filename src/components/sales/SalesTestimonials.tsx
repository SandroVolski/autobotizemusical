import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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
  {
    quote: "Minha escola cresceu 150% em um ano usando o Autobotize. Os relatórios de IA me ajudam a tomar decisões estratégicas que antes eram impossíveis sem dados concretos.",
    author: "Roberto Lima",
    role: "Proprietário, Academia de Música RL",
    avatar: "RL",
    rating: 5,
  },
  {
    quote: "Os pais dos alunos adoram o portal! Eles acompanham o progresso, veem as aulas e pagam tudo pelo celular. A satisfação dos clientes aumentou drasticamente.",
    author: "Fernanda Costa",
    role: "Coordenadora Pedagógica",
    avatar: "FC",
    rating: 5,
  },
];

export const SalesTestimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useGSAP(() => {
    // Header animation - rápida
    gsap.from(headerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });

    // Cards horizontal scroll animation
    const cards = sliderRef.current?.querySelectorAll(".testimonial-card");
    if (cards && cards.length > 0) {
      gsap.set(cards, { opacity: 1, x: 0 }); // Estado inicial
      gsap.from(cards, {
        opacity: 0,
        x: 100,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sliderRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }
  }, { scope: containerRef });

  const scrollToIndex = (index: number) => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.scrollWidth / testimonials.length;
      gsap.to(sliderRef.current, {
        scrollLeft: cardWidth * index,
        duration: 0.5,
        ease: "power3.out",
      });
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : testimonials.length - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < testimonials.length - 1 ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mais de 500 escolas de música confiam no Autobotize
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Horizontal Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="testimonial-card flex-shrink-0 w-[350px] md:w-[400px] snap-center relative p-8 rounded-3xl bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 group hover:scale-105"
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
              <p className="text-foreground leading-relaxed mb-8 line-clamp-5">
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

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "bg-primary w-8" 
                  : "bg-primary/30 hover:bg-primary/50"
              }`}
              aria-label={`Ir para depoimento ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
