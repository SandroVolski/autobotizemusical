import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IconeEscolaMusica from "@/assets/IconeEscolaMusica.png";

gsap.registerPlugin(ScrollTrigger);

export const RevealSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const setupReveal = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const originalText = "Ferramentas poderosas projetadas especificamente para escolas de música, integrando gestão, pedagogia e tecnologia.";
      const highlightWords = ["ferramentas", "poderosas", "escolas", "de", "música", "tecnologia"];

      container.innerHTML = '';
      const words = originalText.trim().split(/\s+/);
      words.forEach(word => {
        const span = document.createElement('span');
        span.innerText = word;
        span.style.display = 'inline-block';
        span.style.marginRight = '0.4em';
        container.appendChild(span);
      });

      const spans = container.querySelectorAll('span');
      const linesData: string[][] = [];
      let currentLine: string[] = [];
      if (spans.length === 0) return;

      let lastTop = (spans[0] as HTMLElement).offsetTop;

      spans.forEach(span => {
        const el = span as HTMLElement;
        if (Math.abs(el.offsetTop - lastTop) > 10) {
          linesData.push(currentLine);
          currentLine = [];
          lastTop = el.offsetTop;
        }
        currentLine.push(el.innerText);
      });
      linesData.push(currentLine);

      container.innerHTML = '';
      linesData.forEach(lineWords => {
        if (lineWords.length === 0) return;

        const lineWrapper = document.createElement('div');
        lineWrapper.className = 'line-wrapper';

        lineWords.forEach((wordText) => {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'word-span';
          wordSpan.innerText = wordText;

          const clean = wordText.toLowerCase().replace(/[.,!?;:]/g, "").trim();
          if (highlightWords.includes(clean)) {
            wordSpan.dataset.highlight = "true";
          }
          lineWrapper.appendChild(wordSpan);
        });

        const strike = document.createElement('div');
        strike.className = 'line-strike';
        lineWrapper.appendChild(strike);

        container.appendChild(lineWrapper);
        container.appendChild(document.createElement('br'));
      });

      const allStrikes = container.querySelectorAll('.line-strike');
      const allWords = container.querySelectorAll('.word-span');

      if (tlRef.current) tlRef.current.kill();

      const tl = gsap.timeline({ paused: true });
      tlRef.current = tl;

      tl.to(allStrikes, {
        scaleX: 0,
        duration: 0.7,
        stagger: 0.25,
        ease: "power3.inOut"
      });

      tl.to(allWords, {
        color: (_i: number, target: HTMLElement) => {
          return target.dataset.highlight === "true" ? "#8000FF" : "#FFFFFF";
        },
        duration: 0.3,
        stagger: 0.02,
        ease: "power2.out"
      }, 0.1);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
      });
    };

    setTimeout(setupReveal, 100);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupReveal, 250);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (tlRef.current) tlRef.current.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === sectionRef.current) t.kill();
      });
    };
  }, []);

  return (
    <div className="bg-[#050505] text-white w-full flex flex-col items-center">
      <div className="w-full">
        <section ref={sectionRef} className="py-12 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-[100px] h-[100px] mb-8 flex items-center justify-center">
            <img
              src={IconeEscolaMusica}
              alt="Ícone Escola de Música"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png';
              }}
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-3xl md:text-6xl font-black mb-16 leading-tight tracking-tighter uppercase font-sans">
            Tudo o que precisa em <br />
            <span style={{ color: '#8000FF' }}>um só lugar</span>
          </h2>

          <div
            ref={containerRef}
            className="reveal-text-container text-2xl md:text-4xl font-bold font-sans"
          />
        </section>
      </div>
      <div className="h-[20vh] w-full"></div>
    </div>
  );
};
