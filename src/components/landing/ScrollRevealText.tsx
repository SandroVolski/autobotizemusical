import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Music2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const originalText = "Ferramentas poderosas projetadas especificamente para escolas de música, integrando gestão, pedagogia e tecnologia.";
const highlightPhrases = ["ferramentas", "poderosas", "escolas", "música", "tecnologia"];

export const ScrollRevealText = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    if (!container || !section) return;

    const setupReveal = () => {
      // 1. Create temporary measurement to detect line breaks
      container.innerHTML = '';
      const words = originalText.trim().split(/\s+/);
      
      words.forEach(word => {
        const span = document.createElement('span');
        span.innerText = word;
        span.style.display = 'inline-block';
        span.style.marginRight = '0.4em';
        container.appendChild(span);
      });

      // 2. Group words by actual browser line
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

      // 3. Rebuild HTML with line wrappers and strikes
      container.innerHTML = '';
      
      linesData.forEach(lineWords => {
        if (lineWords.length === 0) return;

        const lineWrapper = document.createElement('div');
        lineWrapper.className = 'line-wrapper';
        lineWrapper.style.cssText = `
          position: relative;
          display: inline-block;
          margin-bottom: 15px;
          line-height: 1.2;
          white-space: nowrap;
        `;

        lineWords.forEach((wordText) => {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'word-span';
          wordSpan.innerText = wordText;
          wordSpan.style.cssText = `
            display: inline-block;
            color: rgba(255, 255, 255, 0.15);
            margin-right: 0.4em;
            position: relative;
            z-index: 5;
          `;

          // Highlight logic
          const clean = wordText.toLowerCase().replace(/[.,!?;:]/g, "").trim();
          if (highlightPhrases.includes(clean)) {
            wordSpan.dataset.highlight = "true";
          }
          lineWrapper.appendChild(wordSpan);
        });

        const strike = document.createElement('div');
        strike.className = 'line-strike';
        strike.style.cssText = `
          position: absolute;
          top: -2px;
          left: -8px;
          width: calc(100% + 16px);
          height: calc(100% + 4px);
          background-color: hsl(var(--primary));
          transform-origin: right;
          transform: scaleX(1);
          z-index: 10;
          pointer-events: none;
          border-radius: 2px;
        `;
        lineWrapper.appendChild(strike);

        container.appendChild(lineWrapper);
        container.appendChild(document.createElement('br'));
      });

      // 4. Configure Animation
      const allStrikes = container.querySelectorAll('.line-strike');
      const allWords = container.querySelectorAll('.word-span');

      const tl = gsap.timeline({ paused: true });

      // Strike reveal (shrinks to RIGHT, revealing from LEFT)
      tl.to(allStrikes, {
        scaleX: 0,
        duration: 1.2,
        stagger: 0.5,
        ease: "expo.inOut"
      });

      // Color appearance - white for all, purple for highlighted
      tl.to(allWords, {
        color: (i, target) => {
          return (target as HTMLElement).dataset.highlight === "true" 
            ? "#8B5CF6" 
            : "#FFFFFF";
        },
        duration: 0.5,
        stagger: 0.04,
        ease: "power2.out"
      }, 0.3);

      // 5. Scroll Trigger
      ScrollTrigger.create({
        trigger: section,
        start: "top 30%",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
        markers: false
      });

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    };

    const timer = setTimeout(setupReveal, 100);

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupReveal, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 flex flex-col items-center justify-center px-6 text-center"
    >
      {/* Music Icon */}
      <div className="w-24 h-24 mb-8 flex items-center justify-center rounded-2xl bg-primary/10">
        <Music2 className="w-12 h-12 text-primary" />
      </div>

      {/* Heading */}
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-12 leading-tight tracking-tighter uppercase">
        Tudo o que precisa em <br />
        <span className="text-primary">um só lugar</span>
      </h2>

      {/* Reveal Text Container */}
      <div 
        ref={containerRef}
        className="max-w-4xl mx-auto text-xl md:text-3xl lg:text-4xl font-bold"
      />
    </section>
  );
};
