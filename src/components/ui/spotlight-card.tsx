import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** HSL/color string for the spotlight glow */
  spotlightColor?: string;
  /** Disable the 3D tilt (needed when the card lives inside another 3D transform, e.g. a flip container) */
  tilt?: boolean;
}

/**
 * Card with a cursor-following radial spotlight and a subtle 3D tilt on hover.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "hsl(var(--primary) / 0.25)",
  tilt: tiltEnabled = true,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPos({ x, y });
    if (!tiltEnabled) return;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    setTilt({ rx: -py * 6, ry: px * 6 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => {
        setOpacity(0);
        setTilt({ rx: 0, ry: 0 });
      }}
      style={{
        transform: tiltEnabled
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
          : undefined,
        transition: "transform 300ms cubic-bezier(0.22,1,0.36,1), box-shadow 300ms ease",
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl",
        "shadow-[0_4px_24px_hsl(0_0%_0%/0.25)] hover:border-primary/40 hover:shadow-[0_16px_48px_hsl(var(--primary)/0.18)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 60%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
