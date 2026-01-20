import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealTextProps {
  text: string;
  highlightWords?: string[];
  className?: string;
}

export const ScrollRevealText = ({ 
  text, 
  highlightWords = ["ferramentas", "poderosas", "escolas", "de", "música", "tecnologia"],
  className = ""
}: ScrollRevealTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const setupReveal = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';
    
    // 1. Create temporary measurement to detect line breaks
    const words = text.trim().split(/\s+/);
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
      const element = span as HTMLElement;
      if (Math.abs(element.offsetTop - lastTop) > 10) {
        linesData.push(currentLine);
        currentLine = [];
        lastTop = element.offsetTop;
      }
      currentLine.push(element.innerText);
    });
    linesData.push(currentLine);

    // 3. Rebuild HTML with line wrappers and strike bars
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
          color: rgba(255, 255, 255, 0.1);
          margin-right: 0.4em;
          transition: color 0.4s ease;
          position: relative;
          z-index: 5;
        `;
        
        // Highlight logic: clean punctuation to compare
        const clean = wordText.toLowerCase().replace(/[.,!?;:]/g, "").trim();
        if (highlightWords.includes(clean)) {
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

    // Bar reveal (shrinks to RIGHT, revealing from LEFT)
    tl.to(allStrikes, {
      scaleX: 0,
      duration: 1.2,
      stagger: 0.5,
      ease: "expo.inOut"
    });

    // Color appearance (white or primary)
    tl.to(allWords, {
      color: (i, target) => {
        return (target as HTMLElement).dataset.highlight === "true" 
          ? "hsl(var(--primary))" 
          : "hsl(var(--foreground))";
      },
      duration: 0.4,
      stagger: 0.03,
      ease: "power2.out"
    }, 0.2);

    // 5. Scroll Trigger
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 50%",
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
      markers: false
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [text, highlightWords]);

  useEffect(() => {
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
    };
  }, [setupReveal]);

  return (
    <div ref={sectionRef} className={className}>
      <div 
        ref={containerRef} 
        className="reveal-text-container text-xl md:text-2xl lg:text-3xl font-bold max-w-4xl mx-auto text-center"
      />
    </div>
  );
};
