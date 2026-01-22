import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface NoteIconProps {
  type: 'eighth' | 'quarter' | 'double';
  className?: string;
  style?: React.CSSProperties;
  noteRef?: React.RefObject<SVGSVGElement>;
}

const NoteIcon: React.FC<NoteIconProps> = ({ type, className, style, noteRef }) => {
  const paths: Record<string, string> = {
    eighth: "M9 18V5l12-2v13",
    quarter: "M9 18V5",
    double: "M9 18V5l12-2v13M9 10l12-2"
  };
  
  return (
    <svg
      ref={noteRef}
      className={`absolute text-white/40 ${className}`}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[type] || paths.quarter} />
      <circle cx="6" cy="18" r="3" />
      {type === 'eighth' && <circle cx="18" cy="16" r="3" />}
    </svg>
  );
};

export const MusicalTransition = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const notesRef = useRef<(SVGSVGElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(sectionRef.current, { opacity: 0 });

      [path1Ref.current, path2Ref.current].forEach(path => {
        if (!path) return;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      gsap.set(notesRef.current.filter(Boolean), { opacity: 0, scale: 0, y: 40, rotation: 15 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 90%",
          end: "center 55%",
          scrub: 1.5,
        }
      });

      tl.to(sectionRef.current, { opacity: 1, duration: 0.1 }, 0);

      [path1Ref.current, path2Ref.current].forEach(path => {
        if (!path) return;
        tl.to(path, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0);
      });

      notesRef.current.forEach((note, i) => {
        if (!note) return;
        const position = i * 0.15;
        tl.to(note, {
          opacity: 0.4,
          scale: 1,
          y: 0,
          rotation: 0,
          duration: 0.2,
          ease: "back.out(2)"
        }, position);
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const setNoteRef = (index: number) => (el: SVGSVGElement | null) => {
    notesRef.current[index] = el;
  };

  return (
    <div ref={sectionRef} className="relative w-full h-[350px] pointer-events-none z-50 overflow-hidden opacity-0">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <path
          ref={path1Ref}
          d="M-50,150 C150,80 350,320 600,180 S950,20 1200,150"
          stroke="rgba(128, 0, 255, 0.25)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          ref={path2Ref}
          d="M-30,170 C170,100 370,340 620,200 S970,40 1220,170"
          stroke="rgba(0, 246, 156, 0.2)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      <svg ref={setNoteRef(0)} className="absolute text-white/40 w-6 h-6" style={{ left: '15%', top: '35%' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5" />
        <circle cx="6" cy="18" r="3" />
      </svg>
      
      <svg ref={setNoteRef(1)} className="absolute text-white/40 w-8 h-8 rotate-12" style={{ left: '32%', top: '60%' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
      
      <svg ref={setNoteRef(2)} className="absolute text-white/40 w-5 h-5 -rotate-12" style={{ left: '52%', top: '40%' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5" />
        <circle cx="6" cy="18" r="3" />
      </svg>
      
      <svg ref={setNoteRef(3)} className="absolute text-white/40 w-10 h-10 rotate-6" style={{ left: '72%', top: '30%' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13M9 10l12-2" />
        <circle cx="6" cy="18" r="3" />
      </svg>
      
      <svg ref={setNoteRef(4)} className="absolute text-white/40 w-7 h-7 -rotate-6" style={{ left: '88%', top: '50%' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    </div>
  );
};
