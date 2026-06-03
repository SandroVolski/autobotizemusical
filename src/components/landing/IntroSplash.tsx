import { useEffect, useState } from "react";

interface IntroSplashProps {
  durationMs?: number;
  onFinish?: () => void;
}

export const IntroSplash = ({ durationMs = 3500, onFinish }: IntroSplashProps) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Preload the hero background video while the intro is playing
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = "/videos/hero-background.mp4";
    link.type = "video/mp4";
    document.head.appendChild(link);

    const fadeTimer = window.setTimeout(() => setFading(true), durationMs - 500);
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
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src="/intro.webp"
        alt=""
        className="w-full h-full object-cover"
        decoding="async"
      />
    </div>
  );
};