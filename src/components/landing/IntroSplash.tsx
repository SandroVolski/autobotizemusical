import { useEffect, useState } from "react";

interface IntroSplashProps {
  durationMs?: number;
  onFinish?: () => void;
}

export const IntroSplash = ({ durationMs = 3200, onFinish }: IntroSplashProps) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Preload the hero background video in parallel while the intro plays
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = "/videos/hero-background.mp4";
    link.type = "video/mp4";
    document.head.appendChild(link);

    const fadeTimer = window.setTimeout(() => setFading(true), durationMs - 600);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, durationMs);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      link.remove();
    };
  }, [durationMs, onFinish]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden pointer-events-none transition-opacity duration-600 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: "600ms" }}
    >
      <style>{`
        @keyframes introZoom {
          0% { transform: scale(1.08); opacity: 0; filter: blur(8px); }
          15% { opacity: 1; filter: blur(0); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes introGlow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        @keyframes introBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .intro-img { animation: introZoom 3.2s cubic-bezier(0.16,1,0.3,1) forwards; }
        .intro-glow { animation: introGlow 2.4s ease-in-out infinite; }
        .intro-bar::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(128,0,255,0.8), transparent);
          animation: introBar 1.6s ease-in-out infinite;
        }
      `}</style>
      <div className="absolute inset-0 intro-glow bg-[radial-gradient(circle_at_center,rgba(128,0,255,0.35),transparent_60%)]" />
      <img
        src="/intro.webp"
        alt=""
        className="intro-img relative w-full h-full object-cover"
        decoding="async"
        fetchPriority="high"
      />
      <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden bg-white/5">
        <div className="intro-bar absolute inset-0" />
      </div>
    </div>
  );
};