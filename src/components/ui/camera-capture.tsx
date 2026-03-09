import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Check, X } from "lucide-react";

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
}

export function CameraCapture({ open, onOpenChange, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      setCaptured(null);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Permissão da câmera negada. Verifique as configurações do navegador.");
      } else {
        setError("Não foi possível acessar a câmera.");
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      startCamera(facingMode);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, facingMode, startCamera]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/jpeg", 0.9));
  };

  const confirmPhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        onOpenChange(false);
      }
    }, "image/jpeg", 0.9);
  };

  const retake = () => {
    setCaptured(null);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-3">
        <DialogHeader>
          <DialogTitle>Tirar Foto</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          {error ? (
            <div className="w-full aspect-[4/3] rounded-lg bg-muted flex items-center justify-center p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : captured ? (
            <img src={captured} alt="Foto capturada" className="w-full rounded-lg object-contain" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg bg-black"
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }}
            />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {!error && (
            <div className="flex items-center gap-3">
              {captured ? (
                <>
                  <Button variant="outline" size="sm" onClick={retake}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Refazer
                  </Button>
                  <Button size="sm" onClick={confirmPhoto}>
                    <Check className="w-4 h-4 mr-1" />
                    Usar foto
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="icon" onClick={toggleCamera} title="Alternar câmera">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="w-14 h-14 rounded-full" onClick={takePhoto}>
                    <Camera className="w-6 h-6" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onOpenChange(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
