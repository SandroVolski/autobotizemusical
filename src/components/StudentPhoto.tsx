import { useEffect, useState } from "react";
import { createPhotoSignedUrl } from "@/lib/student-photo";

interface StudentPhotoProps {
  fotoUrl?: string | null;
  alt: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  fallback: React.ReactNode;
}

/**
 * Renders a student photo using a freshly generated short-lived signed URL,
 * so links never remain valid after the session/page is gone.
 */
export function StudentPhoto({ fotoUrl, alt, className, onClick, fallback }: StudentPhotoProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSrc(null);
    if (!fotoUrl) return;
    createPhotoSignedUrl(fotoUrl).then((url) => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
    };
  }, [fotoUrl]);

  if (!fotoUrl || !src) return <>{fallback}</>;
  return <img src={src} alt={alt} className={className} onClick={onClick} />;
}
