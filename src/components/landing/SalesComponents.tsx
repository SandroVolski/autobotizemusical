import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AutobotizeLogo from "@/assets/autobotize-logo.webp";
import IconeEscolaMusica from "@/assets/IconeEscolaMusica.png";
import Espiral from "@/assets/espiral.gif";
gsap.registerPlugin(ScrollTrigger);

// --- ÍCONES E UTILIDADES BÁSICAS ---
const ZapIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 00 1.275-1.275L12 3z" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// --- COMPONENTE NOVO: REVEAL SECTION ---
export const RevealSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const setupReveal = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const originalText =
        "Ferramentas poderosas projetadas especificamente para escolas de música, integrando gestão, pedagogia e tecnologia.";
      const highlightWords = ["ferramentas", "poderosas", "escolas", "de", "música", "tecnologia"];

      container.innerHTML = "";
      const words = originalText.trim().split(/\s+/);

      words.forEach((word) => {
        const span = document.createElement("span");
        span.innerText = word;
        span.style.display = "inline-block";
        span.style.marginRight = "0.4em";
        container.appendChild(span);
      });

      const spans = container.querySelectorAll("span");
      const linesData: string[][] = [];
      let currentLine: string[] = [];

      if (spans.length === 0) return;

      let lastTop = (spans[0] as HTMLElement).offsetTop;

      spans.forEach((span) => {
        const el = span as HTMLElement;
        if (Math.abs(el.offsetTop - lastTop) > 10) {
          linesData.push(currentLine);
          currentLine = [];
          lastTop = el.offsetTop;
        }
        currentLine.push(el.innerText);
      });
      linesData.push(currentLine);

      container.innerHTML = "";
      linesData.forEach((lineWords) => {
        if (lineWords.length === 0) return;

        const lineWrapper = document.createElement("div");
        lineWrapper.className = "line-wrapper";

        lineWords.forEach((wordText) => {
          const wordSpan = document.createElement("span");
          wordSpan.className = "word-span";
          wordSpan.innerText = wordText;

          const clean = wordText
            .toLowerCase()
            .replace(/[.,!?;:]/g, "")
            .trim();
          if (highlightWords.includes(clean)) {
            wordSpan.dataset.highlight = "true";
          }
          lineWrapper.appendChild(wordSpan);
        });

        const strike = document.createElement("div");
        strike.className = "line-strike";
        lineWrapper.appendChild(strike);

        container.appendChild(lineWrapper);
        container.appendChild(document.createElement("br"));
      });

      const allStrikes = container.querySelectorAll(".line-strike");
      const allWords = container.querySelectorAll(".word-span");

      if (tlRef.current) tlRef.current.kill();

      const tl = gsap.timeline({ paused: true });
      tlRef.current = tl;

      tl.to(allStrikes, {
        scaleX: 0,
        duration: 0.7,
        stagger: 0.25,
        ease: "power3.inOut",
      });

      tl.to(
        allWords,
        {
          color: (i, target) => {
            return (target as HTMLElement).dataset.highlight === "true" ? "#8000FF" : "#FFFFFF";
          },
          duration: 0.3,
          stagger: 0.02,
          ease: "power2.out",
        },
        0.1,
      );

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
        markers: false,
      });
    };

    setTimeout(setupReveal, 100);

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupReveal, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (tlRef.current) tlRef.current.kill();
    };
  }, []);

  return (
    <div className="bg-[#050505] text-white w-full flex flex-col items-center">
      <div className="w-full">
        <section ref={sectionRef} className="py-12 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-[100px] h-[100px] mb-8 flex items-center justify-center">
            <img src={IconeEscolaMusica} alt="Escola de Música" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl md:text-6xl font-black mb-16 leading-tight tracking-tighter uppercase font-sans">
            Tudo o que precisa em <br />
            <span style={{ color: "#8000FF" }}>um só lugar</span>
          </h2>
          <div ref={containerRef} className="reveal-text-container text-2xl md:text-4xl font-bold font-sans"></div>
        </section>
      </div>
      <div className="h-[20vh] w-full"></div>
    </div>
  );
};

// --- COMPONENTE DE TRANSIÇÃO MUSICAL GSAP ---
export const MusicalTransition = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const notesRef = useRef<(SVGSVGElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(sectionRef.current, { opacity: 0 });

      [path1Ref.current, path2Ref.current].forEach((path) => {
        if (!path) return;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      gsap.set(notesRef.current, { opacity: 0, scale: 0, y: 40, rotation: 15 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 90%",
          end: "center 55%",
          scrub: 1.5,
        },
      });

      tl.to(sectionRef.current, { opacity: 1, duration: 0.1 }, 0);

      [path1Ref.current, path2Ref.current].forEach((path) => {
        if (!path) return;
        tl.to(path, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0);
      });

      notesRef.current.forEach((note, i) => {
        if (!note) return;
        const position = i * 0.15;
        tl.to(
          note,
          {
            opacity: 0.4,
            scale: 1,
            y: 0,
            rotation: 0,
            duration: 0.2,
            ease: "back.out(2)",
          },
          position,
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const NoteIcon = ({
    type,
    className,
    style,
    refIdx,
  }: {
    type: string;
    className: string;
    style: React.CSSProperties;
    refIdx: number;
  }) => {
    const paths: Record<string, string> = {
      eighth: "M9 18V5l12-2v13",
      quarter: "M9 18V5",
      double: "M9 18V5l12-2v13M9 10l12-2",
    };

    return (
      <svg
        ref={(el) => {
          notesRef.current[refIdx] = el;
        }}
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
        {type === "eighth" && <circle cx="18" cy="16" r="3" />}
      </svg>
    );
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
      <NoteIcon refIdx={0} type="quarter" className="w-6 h-6" style={{ left: "15%", top: "35%" }} />
      <NoteIcon refIdx={1} type="eighth" className="w-8 h-8 rotate-12" style={{ left: "32%", top: "60%" }} />
      <NoteIcon refIdx={2} type="quarter" className="w-5 h-5 -rotate-12" style={{ left: "52%", top: "40%" }} />
      <NoteIcon refIdx={3} type="double" className="w-10 h-10 rotate-6" style={{ left: "72%", top: "30%" }} />
      <NoteIcon refIdx={4} type="eighth" className="w-7 h-7 -rotate-6" style={{ left: "88%", top: "50%" }} />
    </div>
  );
};

// --- SHADERS PARA A ESFERA ---
const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;
in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;
out vec2 vUvs;
out float vAlpha;
out float vDepth;
flat out int vInstanceId;
void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);
    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 10.0);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }
    worldPosition.xyz = radius * normalize(worldPosition.xyz);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    float zNorm = normalize(worldPosition.xyz).z;
    vAlpha = smoothstep(0.6, 0.98, zNorm) * 0.95 + 0.05;
    vDepth = zNorm;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}`;

const discFragShaderSource = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
in float vDepth;
flat in int vInstanceId;
void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = st * cellSize + cellOffset;
    vec4 texColor = texture(uTex, st);
    float intensity = smoothstep(-0.8, 0.7, vDepth);
    texColor.rgb *= (intensity * 0.8 + 0.2);
    outColor = texColor;
    outColor.a *= vAlpha;
}`;

// --- UTILITÁRIOS MATEMÁTICOS ---
const vec2Utils = {
  create: () => new Float32Array(2),
  set: (out: Float32Array, x: number, y: number) => {
    out[0] = x;
    out[1] = y;
    return out;
  },
  copy: (out: Float32Array, a: Float32Array) => {
    out[0] = a[0];
    out[1] = a[1];
    return out;
  },
};

const vec3Utils = {
  create: () => new Float32Array(3),
  fromValues: (x: number, y: number, z: number) => new Float32Array([x, y, z]),
  set: (out: Float32Array, x: number, y: number, z: number) => {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  },
  normalize: (out: Float32Array, a: Float32Array) => {
    const x = a[0],
      y = a[1],
      z = a[2];
    let len = x * x + y * y + z * z;
    if (len > 0) len = 1 / Math.sqrt(len);
    else len = 0;
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    return out;
  },
  scale: (out: Float32Array, a: Float32Array, b: number) => {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
  },
  cross: (out: Float32Array, a: Float32Array, b: Float32Array) => {
    const ax = a[0],
      ay = a[1],
      az = a[2],
      bx = b[0],
      by = b[1],
      bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  },
  dot: (a: Float32Array, b: Float32Array) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  transformQuat: (out: Float32Array, a: Float32Array, q: Float32Array) => {
    const qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      x = a[0],
      y = a[1],
      z = a[2];
    const uvx = qy * z - qz * y,
      uvy = qz * x - qx * z,
      uvz = qx * y - qy * x;
    const uuvx = qy * uvz - qz * uvy,
      uuvy = qz * uvx - qx * uvz,
      uuvz = qx * uvy - qy * uvx;
    const w2 = qw * 2;
    out[0] = x + uvx * w2 + uuvx * 2;
    out[1] = y + uvy * w2 + uuvy * 2;
    out[2] = z + uvz * w2 + uuvz * 2;
    return out;
  },
  squaredDistance: (a: Float32Array, b: Float32Array) => {
    const x = a[0] - b[0],
      y = a[1] - b[1],
      z = a[2] - b[2];
    return x * x + y * y + z * z;
  },
};

const mat4Utils = {
  create: () => {
    const out = new Float32Array(16);
    out[0] = out[5] = out[10] = out[15] = 1;
    return out;
  },
  fromScaling: (out: Float32Array, v: Float32Array) => {
    out[0] = v[0];
    out[5] = v[1];
    out[10] = v[2];
    out[15] = 1;
    out[1] = out[2] = out[3] = out[4] = out[6] = out[7] = out[8] = out[9] = out[11] = out[12] = out[13] = out[14] = 0;
    return out;
  },
  fromTranslation: (out: Float32Array, v: Float32Array) => {
    out[0] = out[5] = out[10] = out[15] = 1;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    return out;
  },
  multiply: (out: Float32Array, a: Float32Array, b: Float32Array) => {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3],
      a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7],
      a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11],
      a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
    let b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  },
  invert: (out: Float32Array, a: Float32Array) => {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3],
      a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7],
      a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11],
      a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15],
      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32;
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return null;
    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  },
  perspective: (out: Float32Array, fovy: number, aspect: number, near: number, far: number) => {
    const f = 1.0 / Math.tan(fovy / 2),
      nf = 1 / (near - far);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
    return out;
  },
  targetTo: (out: Float32Array, eye: Float32Array, target: number[], up: number[]) => {
    const eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2];
    let z0 = eyex - target[0],
      z1 = eyey - target[1],
      z2 = eyez - target[2];
    let len = z0 * z0 + z1 * z1 + z2 * z2;
    if (len > 0) {
      len = 1 / Math.sqrt(len);
      z0 *= len;
      z1 *= len;
      z2 *= len;
    }
    let x0 = upy * z2 - upz * z1,
      x1 = upz * z0 - upx * z2,
      x2 = upx * z1 - upy * z0;
    len = x0 * x0 + x1 * x1 + x2 * x2;
    if (len > 0) {
      len = 1 / Math.sqrt(len);
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }
    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = 0;
    out[4] = z1 * x2 - z2 * x1;
    out[5] = z2 * x0 - z0 * x2;
    out[6] = z0 * x1 - z1 * x0;
    out[7] = 0;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = 0;
    out[12] = eyex;
    out[13] = eyey;
    out[14] = eyez;
    out[15] = 1;
    return out;
  },
};

const quatUtils = {
  create: () => new Float32Array([0, 0, 0, 1]),
  set: (out: Float32Array, x: number, y: number, z: number, w: number) => {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  },
  setAxisAngle: (out: Float32Array, axis: Float32Array, rad: number) => {
    rad = rad * 0.5;
    const s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
  },
  multiply: (out: Float32Array, a: Float32Array, b: Float32Array) => {
    const ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3],
      bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  },
  normalize: (out: Float32Array, a: Float32Array) => {
    const x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
    let len = x * x + y * y + z * z + w * w;
    if (len > 0) {
      len = 1 / Math.sqrt(len);
      out[0] = x * len;
      out[1] = y * len;
      out[2] = z * len;
      out[3] = w * len;
    }
    return out;
  },
  slerp: (out: Float32Array, a: Float32Array, b: Float32Array, t: number) => {
    let ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
    let bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
    let cosom = ax * bx + ay * by + az * bz + aw * bw;
    if (cosom < 0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    let scale0, scale1;
    if (1.0 - cosom > 0.000001) {
      const omega = Math.acos(cosom),
        sinom = Math.sin(omega);
      scale0 = Math.sin((1.0 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      scale0 = 1.0 - t;
      scale1 = t;
    }
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    return out;
  },
  conjugate: (out: Float32Array, a: Float32Array) => {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
  },
};

// --- CLASSES DE GEOMETRIA ---
class Vertex {
  position: Float32Array;
  normal: Float32Array;
  uv: Float32Array;
  constructor(x: number, y: number, z: number) {
    this.position = vec3Utils.fromValues(x, y, z);
    this.normal = vec3Utils.create();
    this.uv = vec2Utils.create();
  }
}

class Face {
  a: number;
  b: number;
  c: number;
  constructor(a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
}

class Geometry {
  vertices: Vertex[];
  faces: Face[];

  constructor() {
    this.vertices = [];
    this.faces = [];
  }

  addVertex(x: number, y: number, z: number) {
    this.vertices.push(new Vertex(x, y, z));
    return this;
  }

  addFace(a: number, b: number, c: number) {
    this.faces.push(new Face(a, b, c));
    return this;
  }

  subdivide(divisions = 1) {
    const cache: Record<string, number> = {};
    for (let div = 0; div < divisions; ++div) {
      const newFaces: Face[] = [];
      this.faces.forEach((face) => {
        const mAB = this.getMid(face.a, face.b, cache),
          mBC = this.getMid(face.b, face.c, cache),
          mCA = this.getMid(face.c, face.a, cache);
        newFaces.push(
          new Face(face.a, mAB, mCA),
          new Face(face.b, mBC, mAB),
          new Face(face.c, mCA, mBC),
          new Face(mAB, mBC, mCA),
        );
      });
      this.faces = newFaces;
    }
    return this;
  }

  getMid(ndxA: number, ndxB: number, cache: Record<string, number>) {
    const key = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`;
    if (cache[key] !== undefined) return cache[key];
    const a = this.vertices[ndxA].position,
      b = this.vertices[ndxB].position,
      ndx = this.vertices.length;
    cache[key] = ndx;
    this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
    return ndx;
  }

  spherize(radius = 1) {
    this.vertices.forEach((v) => {
      vec3Utils.normalize(v.normal, v.position);
      vec3Utils.scale(v.position, v.normal, radius);
    });
    return this;
  }

  get data() {
    return {
      vertices: new Float32Array(this.vertices.flatMap((v) => Array.from(v.position))),
      indices: new Uint16Array(this.faces.flatMap((f) => [f.a, f.b, f.c])),
      uvs: new Float32Array(this.vertices.flatMap((v) => Array.from(v.uv))),
    };
  }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    const verts: [number, number, number][] = [
      [-1, t, 0],
      [1, t, 0],
      [-1, -t, 0],
      [1, -t, 0],
      [0, -1, t],
      [0, 1, t],
      [0, -1, -t],
      [0, 1, -t],
      [t, 0, -1],
      [t, 0, 1],
      [-t, 0, -1],
      [-t, 0, 1],
    ];
    verts.forEach((v) => this.addVertex(...v));
    const faces: [number, number, number][] = [
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],
      [1, 5, 9],
      [5, 11, 4],
      [11, 10, 2],
      [10, 7, 6],
      [7, 1, 8],
      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 6, 8],
      [3, 8, 9],
      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
      [9, 8, 1],
    ];
    faces.forEach((f) => this.addFace(...f));
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super();
    const alpha = (2 * Math.PI) / steps;
    this.addVertex(0, 0, 0);
    this.vertices[0].uv[0] = 0.5;
    this.vertices[0].uv[1] = 0.5;
    for (let i = 0; i < steps; ++i) {
      const x = Math.cos(alpha * i),
        y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      const v = this.vertices[this.vertices.length - 1];
      v.uv[0] = x * 0.5 + 0.5;
      v.uv[1] = y * 0.5 + 0.5;
      if (i > 0) this.addFace(0, i, i + 1);
    }
    this.addFace(0, steps, 1);
  }
}

// --- UTILITÁRIOS WEBGL ---
function createShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : (console.error(gl.getShaderInfoLog(s)), null);
}

function createProgram(gl: WebGL2RenderingContext, vs: string, fs: string, attribs?: Record<string, number>) {
  const p = gl.createProgram();
  if (!p) return null;
  const vShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
  if (!vShader || !fShader) return null;
  gl.attachShader(p, vShader);
  gl.attachShader(p, fShader);
  if (attribs) Object.keys(attribs).forEach((k) => gl.bindAttribLocation(p, attribs[k], k));
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : (console.error(gl.getProgramInfoLog(p)), null);
}

// --- CONTROLE ARCBALL ---
class ArcballControl {
  canvas: HTMLCanvasElement;
  isPointerDown: boolean;
  orientation: Float32Array;
  pointerRotation: Float32Array;
  rotationVelocity: number;
  rotationAxis: Float32Array;
  snapDirection: Float32Array;
  snapTargetDirection: Float32Array | null;
  pPos: Float32Array;
  prevPPos: Float32Array;
  _rv: number;
  _combQ: Float32Array;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.isPointerDown = false;
    this.orientation = quatUtils.create();
    this.pointerRotation = quatUtils.create();
    this.rotationVelocity = 0;
    this.rotationAxis = vec3Utils.fromValues(1, 0, 0);
    this.snapDirection = vec3Utils.fromValues(0, 0, 1);
    this.snapTargetDirection = null;
    this.pPos = vec2Utils.create();
    this.prevPPos = vec2Utils.create();
    this._rv = 0;
    this._combQ = quatUtils.create();

    canvas.addEventListener("pointerdown", (e) => {
      const rect = canvas.getBoundingClientRect();
      vec2Utils.set(this.pPos, e.clientX - rect.left, e.clientY - rect.top);
      vec2Utils.copy(this.prevPPos, this.pPos);
      this.isPointerDown = true;
    });
    window.addEventListener("pointerup", () => {
      this.isPointerDown = false;
    });
    window.addEventListener("pointermove", (e) => {
      if (this.isPointerDown) {
        const rect = canvas.getBoundingClientRect();
        vec2Utils.set(this.pPos, e.clientX - rect.left, e.clientY - rect.top);
      }
    });
    canvas.style.touchAction = "none";
  }

  update(dt: number) {
    const ts = dt / 16.6;
    const snapQ = quatUtils.create();

    if (this.isPointerDown) {
      const p = this.proj(this.pPos);
      const q = this.proj(this.prevPPos);
      if (vec3Utils.squaredDistance(p, q) > 0.00001) {
        this.quatVecs(
          vec3Utils.normalize(vec3Utils.create(), p),
          vec3Utils.normalize(vec3Utils.create(), q),
          this.pointerRotation,
          2.0,
        );
        vec2Utils.copy(this.prevPPos, this.pPos);
      }
    } else {
      quatUtils.slerp(this.pointerRotation, this.pointerRotation, new Float32Array([0, 0, 0, 1]), 0.1 * ts);
      if (this.snapTargetDirection) {
        this.quatVecs(this.snapTargetDirection, this.snapDirection, snapQ, 0.08 * ts);
      }
    }

    const comb = quatUtils.multiply(quatUtils.create(), snapQ, this.pointerRotation);
    this.orientation = quatUtils.multiply(quatUtils.create(), comb, this.orientation);
    quatUtils.normalize(this.orientation, this.orientation);

    quatUtils.slerp(this._combQ, this._combQ, comb, 0.7 * ts);
    const s = Math.sqrt(Math.max(0, 1 - this._combQ[3] * this._combQ[3]));
    if (s > 0.001) {
      vec3Utils.set(this.rotationAxis, this._combQ[0] / s, this._combQ[1] / s, this._combQ[2] / s);
      const rv = Math.acos(Math.max(-1, Math.min(1, this._combQ[3]))) / Math.PI;
      this._rv += (rv - this._rv) * 0.4 * ts;
      this.rotationVelocity = this._rv / ts;
    } else {
      this.rotationVelocity = 0;
    }
  }

  quatVecs(a: Float32Array, b: Float32Array, out: Float32Array, f = 1) {
    const dot = vec3Utils.dot(a, b);
    if (dot > 0.99999) {
      quatUtils.set(out, 0, 0, 0, 1);
      return;
    }
    if (dot < -0.99999) {
      const axis = Math.abs(a[0]) > 0.1 ? vec3Utils.fromValues(0, 1, 0) : vec3Utils.fromValues(1, 0, 0);
      const ortho = vec3Utils.normalize(vec3Utils.create(), vec3Utils.cross(vec3Utils.create(), a, axis));
      quatUtils.setAxisAngle(out, ortho, Math.PI * f);
      return;
    }
    const axis = vec3Utils.cross(vec3Utils.create(), a, b);
    const len = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if (len < 0.00001) {
      quatUtils.set(out, 0, 0, 0, 1);
      return;
    }
    vec3Utils.scale(axis, axis, 1 / len);
    quatUtils.setAxisAngle(out, axis, Math.acos(dot) * f);
  }

  proj(pos: Float32Array) {
    const w = this.canvas.clientWidth,
      h = this.canvas.clientHeight,
      s = Math.max(w, h);
    const x = (2 * pos[0] - w) / s,
      y = (2 * pos[1] - h) / s;
    const zSq = x * x + y * y;
    return vec3Utils.fromValues(-x, y, zSq <= 4 ? Math.sqrt(4 - zSq) : 4 / Math.sqrt(zSq));
  }
}

// --- COMPONENTE SOCIAL PROOF SPHERE ---
export const SocialProofSphere = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeItem, setActiveItem] = useState<{
    initials: string;
    name: string;
    role: string;
    quote: string;
    color: string;
    image: string;
  } | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const testimonials = [
    {
      initials: "SV",
      name: "Sandro Volski",
      role: "Proprietário da\nEscola de Música",
      quote: "Zeramos a inadimplência com as cobranças automáticas. O controle financeiro é impecável.",
      color: "#00FFA1",
      image: "https://i.pravatar.cc/300?u=sandro",
    },
    {
      initials: "CS",
      name: "Carlos Santos",
      role: "Professor de Piano",
      quote: "A IA pedagógica é incrível! Sugere repertórios personalizados que meus alunos adoram.",
      color: "#FFFFFF",
      image: "https://i.pravatar.cc/300?u=carlos",
    },
    {
      initials: "MS",
      name: "Maria Silva",
      role: "Proprietária do MusicFlow",
      quote: "Reduzi 70% do tempo gasto com tarefas administrativas. Agora ensino música.",
      color: "#8000FF",
      image: "https://i.pravatar.cc/300?u=maria",
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) return;

    const discGeo = new DiscGeometry(64, 1).data;
    const icoGeo = new IcosahedronGeometry().subdivide(1).spherize(2);
    const instancePositions = icoGeo.vertices.map((v) => v.position);
    const instanceCount = instancePositions.length;

    const control = new ArcballControl(canvas);
    const initialTarget = vec3Utils.normalize(vec3Utils.create(), instancePositions[0]);
    const startPos = vec3Utils.fromValues(0, 0, 1);
    const axis = vec3Utils.normalize(vec3Utils.create(), vec3Utils.cross(vec3Utils.create(), initialTarget, startPos));
    const angle = Math.acos(Math.max(-1, Math.min(1, vec3Utils.dot(initialTarget, startPos))));
    quatUtils.setAxisAngle(control.orientation, axis, angle);
    setActiveItem(testimonials[0]);

    const program = createProgram(gl, discVertShaderSource, discFragShaderSource, {
      aModelPosition: 0,
      aModelUvs: 2,
      aInstanceMatrix: 3,
    });
    if (!program) return;

    const locs = {
      uWorldMatrix: gl.getUniformLocation(program, "uWorldMatrix"),
      uViewMatrix: gl.getUniformLocation(program, "uViewMatrix"),
      uProjectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
      uRotationAxisVelocity: gl.getUniformLocation(program, "uRotationAxisVelocity"),
      uItemCount: gl.getUniformLocation(program, "uItemCount"),
      uAtlasSize: gl.getUniformLocation(program, "uAtlasSize"),
      uTex: gl.getUniformLocation(program, "uTex"),
    };

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const makeB = (data: Float32Array, loc: number, size: number) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };

    makeB(discGeo.vertices, 0, 3);
    makeB(discGeo.uvs, 2, 2);

    const idxB = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxB);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, discGeo.indices, gl.STATIC_DRAW);

    const matricesData = new Float32Array(instanceCount * 16);
    const instB = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instB);
    gl.bufferData(gl.ARRAY_BUFFER, matricesData.byteLength, gl.DYNAMIC_DRAW);

    for (let i = 0; i < 4; i++) {
      gl.enableVertexAttribArray(3 + i);
      gl.vertexAttribPointer(3 + i, 4, gl.FLOAT, false, 64, i * 16);
      gl.vertexAttribDivisor(3 + i, 1);
    }

    const atlasSize = Math.ceil(Math.sqrt(testimonials.length));
    const tex = gl.createTexture();
    const cellSize = 512;

    const drawAtlas = async (images: (HTMLImageElement | null)[] = []) => {
      const offC = document.createElement("canvas");
      const ctx = offC.getContext("2d");
      if (!ctx) return;
      offC.width = offC.height = atlasSize * cellSize;

      for (let i = 0; i < testimonials.length; i++) {
        const t = testimonials[i];
        const x = (i % atlasSize) * cellSize,
          y = Math.floor(i / atlasSize) * cellSize,
          cx = x + 256,
          cy = y + 256;
        ctx.save();
        const g = ctx.createRadialGradient(cx, cy, 100, cx, cy, 250);
        g.addColorStop(0, t.color);
        g.addColorStop(1, "#000000");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 240, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 15;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 230, 0, Math.PI * 2);
        ctx.clip();
        if (images[i]) {
          ctx.drawImage(images[i]!, cx - 230, cy - 230, 460, 460);
        } else {
          ctx.fillStyle = t.color === "#FFFFFF" ? "#000" : "#FFF";
          ctx.font = "bold 180px Montserrat, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(t.initials, cx, cy);
        }
        ctx.restore();
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offC);
      gl.generateMipmap(gl.TEXTURE_2D);
    };

    drawAtlas();
    Promise.all(
      testimonials.map((t) => {
        return new Promise<HTMLImageElement | null>((res) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = t.image;
          img.onload = () => res(img);
          img.onerror = () => res(null);
        });
      }),
    ).then((imgs) => drawAtlas(imgs));

    const viewM = mat4Utils.create();
    const projM = mat4Utils.create();
    let camZ = 5;
    let lastInteractionTime = Date.now();
    let currentVtxIndex = 0;
    let lastFrameTime = performance.now();
    let animationFrameId: number;

    const loop = (currentTime: number) => {
      if (!canvas) return;
      const dt = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth * dpr,
        h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      const now = Date.now();
      if (control.isPointerDown) lastInteractionTime = now;
      control.update(dt);

      const mov = control.isPointerDown || Math.abs(control.rotationVelocity) > 0.005;
      setIsMoving(mov);

      if (!control.isPointerDown) {
        if (now - lastInteractionTime > 5000) {
          currentVtxIndex = (currentVtxIndex + 14) % instanceCount;
          lastInteractionTime = now;
        }
        const targetLocalPos = instancePositions[currentVtxIndex];
        const targetWorldPos = vec3Utils.transformQuat(vec3Utils.create(), targetLocalPos, control.orientation);
        const safeTarget = vec3Utils.normalize(vec3Utils.create(), targetWorldPos);
        if (safeTarget[0] === 0 && safeTarget[1] === 0 && safeTarget[2] === 0) {
          control.snapTargetDirection = vec3Utils.fromValues(0, 0, 1);
        } else {
          control.snapTargetDirection = safeTarget;
        }
        const invQ = quatUtils.conjugate(quatUtils.create(), control.orientation);
        const forwardVecOnSphere = vec3Utils.transformQuat(vec3Utils.create(), new Float32Array([0, 0, 1]), invQ);

        let maxD = -1,
          nearest = 0;
        instancePositions.forEach((pos, i) => {
          const d = vec3Utils.dot(forwardVecOnSphere, pos);
          if (d > maxD) {
            maxD = d;
            nearest = i;
          }
        });

        const index = nearest % testimonials.length;
        setActiveItem(testimonials[index]);
      } else {
        const invQ = quatUtils.conjugate(quatUtils.create(), control.orientation);
        const forwardVecOnSphere = vec3Utils.transformQuat(vec3Utils.create(), new Float32Array([0, 0, 1]), invQ);
        let maxD = -1,
          nearest = 0;
        instancePositions.forEach((pos, i) => {
          const d = vec3Utils.dot(forwardVecOnSphere, pos);
          if (d > maxD) {
            maxD = d;
            nearest = i;
          }
        });
        currentVtxIndex = nearest;
        camZ += (5 + control.rotationVelocity * 40 - camZ) * 0.1;
      }

      if (!control.isPointerDown) camZ += (4.2 - camZ) * 0.08;

      mat4Utils.perspective(projM, Math.PI / 4.5, canvas.width / canvas.height, 0.1, 100);
      mat4Utils.invert(viewM, mat4Utils.fromTranslation(mat4Utils.create(), new Float32Array([0, 0, camZ])));

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(program);

      instancePositions.forEach((pos, i) => {
        const worldP = vec3Utils.transformQuat(vec3Utils.create(), pos, control.orientation);
        const s = (Math.abs(worldP[2]) / 2) * 0.6 + 0.4;
        const m = mat4Utils.create();
        mat4Utils.multiply(m, m, mat4Utils.targetTo(mat4Utils.create(), worldP, [0, 0, 0], [0, 1, 0]));
        mat4Utils.multiply(
          m,
          m,
          mat4Utils.fromScaling(mat4Utils.create(), new Float32Array([0.3 * s, 0.3 * s, 0.3 * s])),
        );
        for (let j = 0; j < 16; j++) matricesData[i * 16 + j] = m[j];
      });

      gl.bindBuffer(gl.ARRAY_BUFFER, instB);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, matricesData);
      gl.uniformMatrix4fv(locs.uWorldMatrix, false, mat4Utils.create());
      gl.uniformMatrix4fv(locs.uViewMatrix, false, viewM);
      gl.uniformMatrix4fv(locs.uProjectionMatrix, false, projM);
      gl.uniform4f(
        locs.uRotationAxisVelocity,
        control.rotationAxis[0],
        control.rotationAxis[1],
        control.rotationAxis[2],
        control.rotationVelocity || 0,
      );
      gl.uniform1i(locs.uItemCount, testimonials.length);
      gl.uniform1i(locs.uAtlasSize, atlasSize);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.bindVertexArray(vao);
      gl.drawElementsInstanced(gl.TRIANGLES, discGeo.indices.length, gl.UNSIGNED_SHORT, 0, instanceCount);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div id="depoimentos" className="relative w-full min-h-[85vh] md:min-h-screen bg-black flex flex-col items-center select-none py-16 overflow-hidden montserrat-font">
      <div className="w-full text-center mb-8 z-[100] relative pointer-events-none px-6">
        <h3 className="text-[#00FFA1] font-bold tracking-[0.5em] uppercase text-[10px] mb-4 opacity-70">Depoimentos</h3>
        <h1 className="text-white text-4xl md:text-6xl font-black tracking-tight leading-none mx-auto max-w-4xl">
          Impacto do nosso <span className="text-[#8000FF] italic">ecossistema</span>
        </h1>
      </div>
      <div className="flex-1 w-full relative flex items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-[20] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-[20] pointer-events-none"></div>
        <div className="absolute top-[5%] md:top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[90] pointer-events-none text-center px-4">
          <div
            className={`transition-all duration-1000 ease-out ${isMoving || !activeItem ? "opacity-0 -translate-y-8 scale-90" : "opacity-100 translate-y-0 scale-100"}`}
          >
            {activeItem && (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
                  <span className="text-white/40 font-bold text-[10px] uppercase tracking-[0.6em]">
                    Membro Verificado
                  </span>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
                </div>
                <h2 className="text-white text-3xl md:text-5xl font-black tracking-tighter leading-none mb-2">
                  {activeItem.name.split(" ")[0]}{" "}
                  <span style={{ color: activeItem.color }} className="italic font-light">
                    {activeItem.name.split(" ").slice(1).join(" ")}
                  </span>
                </h2>
                <p className="text-white/60 font-medium text-[11px] md:text-xs uppercase tracking-[0.4em] whitespace-pre-line">
                  {activeItem.role}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="w-full h-[400px] md:h-[700px] flex items-center justify-center relative z-[10]">
          <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing outline-none block" />
        </div>
        <div className="absolute bottom-[5%] md:bottom-[10%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[90] pointer-events-none text-center px-6">
          <div
            className={`transition-all duration-1000 ease-in-out p-6 rounded-3xl backdrop-blur-md bg-white/[0.01] ${isMoving || !activeItem ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"}`}
          >
            {activeItem && (
              <div className="relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl text-[#00FFA1] opacity-20 font-serif">
                  "
                </span>
                <p className="text-white/90 text-sm md:text-lg font-medium leading-relaxed italic tracking-wide">
                  {activeItem.quote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 opacity-20 flex items-center gap-4 text-white text-[9px] font-black tracking-[0.8em] uppercase">
        <div className="w-12 h-[1px] bg-white"></div>
        Arraste para explorar
        <div className="w-12 h-[1px] bg-white"></div>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES DO FOOTER ---
const Marquee = () => {
  const logos = ["AUTOBOTIZE", "HARMONIA", "AUTOMAÇÃO", "GESTÃO", "ORGANIZAÇÃO", "MELODIA", "MÚSICA", "CONEXÃO"];
  return (
    <div className="relative flex overflow-x-hidden border-y border-white/5 py-8 select-none mt-12">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {logos.map((logo, i) => (
          <div key={i} className="flex items-center">
            <span className="mx-12 text-6xl md:text-8xl font-black text-white/5 hover:text-[#8000FF] transition-colors duration-700 cursor-default uppercase italic tracking-tighter montserrat-font">
              {logo}
            </span>
            <div className="w-2 h-2 bg-[#8000FF] rotate-45 opacity-30" />
          </div>
        ))}
      </div>
      <div className="absolute top-8 animate-marquee2 whitespace-nowrap flex items-center">
        {logos.map((logo, i) => (
          <div key={i} className="flex items-center">
            <span className="mx-12 text-6xl md:text-8xl font-black text-white/5 hover:text-[#8000FF] transition-colors duration-700 cursor-default uppercase italic tracking-tighter montserrat-font">
              {logo}
            </span>
            <div className="w-2 h-2 bg-[#8000FF] rotate-45 opacity-30" />
          </div>
        ))}
      </div>
    </div>
  );
};

const FooterLink = ({ children, href = "#" }: { children: React.ReactNode; href?: string }) => (
  <a
    href={href}
    className="group flex items-center gap-3 py-1.5 text-gray-500 hover:text-white transition-all duration-300"
  >
    <ChevronRight className="w-3 h-3 text-[#8000FF] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
    <span className="uppercase text-[11px] tracking-[0.2em] font-bold italic montserrat-font">{children}</span>
  </a>
);

// --- SEÇÃO DE NOTEBOOK COM SCROLL HORIZONTAL ---
export const NotebookFeaturesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const notebookContainerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);

  const features = [
    {
      title: "Gestão de Alunos",
      desc: "Registo completo, histórico de matrículas, progresso individual e comunicação direta.",
      img: "https://images.unsplash.com/photo-1577891776198-c28c302f0b1a?auto=format&fit=crop&w=800&q=80",
      bgText: "GESTÃO",
    },
    {
      title: "Agenda Inteligente",
      desc: "Agendamento automático, controlo de presença e sincronização com calendários externos.",
      img: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80",
      bgText: "ESCOLA",
    },
    {
      title: "Controle Financeiro",
      desc: "Mensalidades, cobranças automáticas, relatórios de incumprimento e projeções.",
      img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      bgText: "FINANÇAS",
    },
    {
      title: "IA Pedagógica",
      desc: "Sugestões de repertório, planos de aula personalizados e análise de evolução.",
      img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      bgText: "INTELIGÊNCIA",
    },
    {
      title: "Material Didático",
      desc: "Biblioteca digital, pautas, vídeo-aulas e recursos partilhados.",
      img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80",
      bgText: "MÚSICA",
    },
    {
      title: "Comunicação",
      desc: "Avisos automáticos, lembretes de aulas e notificações personalizadas.",
      img: "https://images.unsplash.com/photo-1577563906417-45a11b3f9f7c?auto=format&fit=crop&w=800&q=80",
      bgText: "CONEXÃO",
    },
    {
      title: "Relatórios Avançados",
      desc: "Dashboards em tempo real, métricas de desempenho e insights acionáveis.",
      img: "https://images.unsplash.com/photo-1551288049-bbbda536ad0a?auto=format&fit=crop&w=800&q=80",
      bgText: "DADOS",
    },
    {
      title: "Multi-instrumentos",
      desc: "Suporte para todos os instrumentos com configurações específicas para cada um.",
      img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
      bgText: "SISTEMA",
    },
  ];

  // Detectar mobile com cleanup seguro do GSAP
  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== isMobile) {
        // Limpar GSAP antes de mudar estado
        if (gsapCtxRef.current) {
          gsapCtxRef.current.revert();
          gsapCtxRef.current = null;
        }
        setIsMobile(newIsMobile);
      }
    };
    
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile]);

  // GSAP Pinning APENAS para desktop
  useEffect(() => {
    if (isMobile) return;
    if (!notebookContainerRef.current || !horizontalRef.current || !lidRef.current) return;

    const totalFeatures = features.length;
    const openDur = 1;
    const scrollDur = totalFeatures * 2.5;
    const closeDur = 1;
    const totalDur = openDur + scrollDur + closeDur;

    const snapPoints = [0];
    snapPoints.push(openDur / totalDur);
    for (let i = 1; i < totalFeatures; i++) {
      const step = (scrollDur / (totalFeatures - 1)) * i;
      snapPoints.push((openDur + step) / totalDur);
    }
    snapPoints.push(1);

    gsapCtxRef.current = gsap.context(() => {
      const notebookTl = gsap.timeline({
        scrollTrigger: {
          trigger: notebookContainerRef.current,
          pin: true,
          start: "top top",
          end: () => `+=${window.innerHeight * totalFeatures * 1.5}`,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: (value: number) => {
              const closest = snapPoints.reduce((prev, curr) =>
                Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
              );
              return closest;
            },
            duration: { min: 0.2, max: 0.6 },
            delay: 0.05,
            ease: "power2.inOut",
          },
          onUpdate: (self) => {
            const p = self.progress;
            const openThreshold = openDur / totalDur;
            const closeThreshold = (openDur + scrollDur) / totalDur;
            if (p < openThreshold) {
              setActiveIndex(0);
            } else if (p > closeThreshold) {
              setActiveIndex(totalFeatures - 1);
            } else {
              const normalized = (p - openThreshold) / (scrollDur / totalDur);
              const index = Math.max(0, Math.min(Math.round(normalized * (totalFeatures - 1)), totalFeatures - 1));
              setActiveIndex(index);
            }
          },
        },
      });

      notebookTl.fromTo(lidRef.current, { rotateX: -95 }, { rotateX: 0, duration: openDur, ease: "none" });
      notebookTl.to(horizontalRef.current, {
        x: () => -(horizontalRef.current!.scrollWidth - window.innerWidth),
        ease: "none",
        duration: scrollDur,
      });
      notebookTl.to(lidRef.current, { rotateX: -95, duration: closeDur, ease: "none" });

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    }, notebookContainerRef);

    return () => {
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
        gsapCtxRef.current = null;
      }
    };
  }, [isMobile]);

  // Componente Mobile separado para evitar conflitos de DOM
  const MobileCarousel = () => (
    <div id="recursos-premium" className="relative w-full bg-zinc-950 py-16 overflow-hidden">
      {/* Label */}
      <div className="flex justify-center mb-8">
        <span className="text-[#8000FF] font-black tracking-[0.5em] uppercase text-[9px] bg-zinc-900/60 py-2 px-6 backdrop-blur-md rounded-full border border-white/5">
          Recursos Premium
        </span>
      </div>

      {/* Carrossel horizontal swipeable */}
      <div 
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 px-4 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          const cardWidth = e.currentTarget.offsetWidth * 0.85;
          const newIndex = Math.round(scrollLeft / cardWidth);
          setActiveIndex(Math.max(0, Math.min(newIndex, features.length - 1)));
        }}
      >
        {features.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[85vw] snap-center"
          >
            <div className="relative bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden h-[400px]">
              {/* Imagem de fundo */}
              <div className="absolute inset-0">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover grayscale-[30%] brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
              </div>

              {/* Texto de fundo decorativo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h4
                  className="text-[25vw] font-black uppercase leading-none transform -rotate-12 text-transparent"
                  style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.03)" }}
                >
                  {item.bgText}
                </h4>
              </div>

              {/* Conteúdo */}
              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <h3 className="text-2xl font-black tracking-tight uppercase italic bg-gradient-to-r from-[#8000FF] to-[#00D084] bg-clip-text text-transparent mb-3">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Glow effect */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[60%] h-20 bg-[#8000FF]/20 blur-[40px] rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores de página */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {features.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              activeIndex === i 
                ? "w-8 bg-[#8000FF] shadow-[0_0_15px_rgba(128,0,255,0.4)]" 
                : "w-2 bg-zinc-700"
            }`}
          />
        ))}
      </div>

      {/* Dica de swipe */}
      <p className="text-center text-zinc-600 text-xs mt-4 flex items-center justify-center gap-2">
        <span>←</span> Arraste para ver mais <span>→</span>
      </p>
    </div>
  );

  // Retornar mobile ou desktop baseado no estado
  if (isMobile) {
    return <MobileCarousel />;
  }

  // Versão DESKTOP com pinning e animação 3D do notebook
  return (
    <div id="recursos-premium" ref={notebookContainerRef} className="relative h-screen w-full overflow-hidden bg-zinc-950">
      <div className="absolute top-10 left-0 w-full z-50 pointer-events-none flex justify-center">
        <span className="text-[#8000FF] font-black tracking-[0.5em] uppercase text-[9px] bg-zinc-900/60 py-2 px-6 backdrop-blur-md rounded-full border border-white/5">
          Recursos Premium
        </span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 px-4">
        <div
          className="relative w-full max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl flex flex-col items-center"
          style={{ perspective: "2000px" }}
        >
          <div
            ref={lidRef}
            className="relative w-full bg-gradient-to-b from-zinc-300 to-zinc-500 p-[2px] rounded-t-xl shadow-[0_0_120px_rgba(128,0,255,0.2)] border border-white/10 will-change-transform z-10"
            style={{ transformOrigin: "bottom", transform: "rotateX(-95deg)", backfaceVisibility: "hidden" }}
          >
            <div className="relative bg-[#050505] rounded-lg overflow-hidden aspect-video border-[6px] md:border-[10px] border-[#0a0a0a]">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${activeIndex === idx ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale-[20%] brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative w-[112%] h-4 sm:h-6 -mt-[1px] z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-400 to-zinc-800 rounded-b-xl border-t border-white/20"></div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-[#8000FF]/30 blur-[60px] rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
      <div
        ref={horizontalRef}
        className="absolute inset-0 flex h-full will-change-transform z-20"
        style={{ width: `${features.length * 100}vw` }}
      >
        {features.map((item, index) => (
          <div
            key={index}
            className="w-screen h-full flex flex-col items-center justify-between py-20 sm:py-28 flex-shrink-0 relative overflow-hidden"
          >
            <div className="relative z-40 w-full text-center px-6 mt-16 sm:mt-0">
              <div
                className={`transition-all duration-700 ease-out ${activeIndex === index ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}`}
              >
                <h3 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-[#8000FF] to-[#00D084] bg-clip-text text-transparent drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                  {item.title}
                </h3>
              </div>
            </div>
            <div className="relative z-40 w-full text-center px-8 mb-16 sm:mb-8">
              <div
                className={`transition-all duration-700 delay-100 ease-out ${activeIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <p className="text-zinc-400 text-sm sm:text-lg md:text-xl leading-relaxed font-light max-w-2xl mx-auto drop-shadow-md">
                  {item.desc}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <h4
                className="text-[22vw] font-black uppercase leading-none transform -rotate-12 transition-all duration-1000 text-transparent"
                style={{
                  WebkitTextStroke: "1px rgba(255, 255, 255, 0.06)",
                  opacity: activeIndex === index ? 0.8 : 0.1,
                }}
              >
                {item.bgText}
              </h4>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-8 left-0 w-full z-40 pointer-events-none">
        <div className="flex justify-center items-center gap-3">
          {features.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-700 ${activeIndex === i ? "w-16 bg-[#8000FF] shadow-[0_0_15px_rgba(128,0,255,0.4)]" : "w-3 bg-zinc-800"}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SEÇÃO ESPIRAL CTA ---
export const SpiralCTASection = () => {
  const triggerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const ctaContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      const spiralTl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      spiralTl.to(imageRef.current, {
        scale: 12,
        filter: "blur(25px)",
        opacity: 0,
        ease: "power2.in",
      });
    }, triggerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="relative overflow-hidden min-h-[50vh] pt-8 md:pt-16 pb-0 flex flex-col items-center font-sans">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#8000FF]/15 rounded-full blur-[120px]" />
          <div className="absolute top-[10%] right-[-15%] w-[500px] h-[500px] bg-[#00F69C]/10 rounded-full blur-[140px]" />
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <div ref={ctaContentRef} className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="relative group mb-8 cursor-default">
              <div className="absolute -inset-px bg-gradient-to-r from-[#00F69C]/40 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#00F69C]/10 border border-[#00F69C]/20">
                  <ZapIcon className="w-3 h-3 text-[#00F69C]" />
                </div>
                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/90">
                  3 dias grátis <span className="mx-2 text-white/20">|</span>
                  <span className="text-white/60 font-medium tracking-[0.15em]">Sem compromisso</span>
                </span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight uppercase text-white drop-shadow-lg">
              Pronto para transformar sua{" "}
              <span className="text-[#00F69C] relative inline-block">
                escola de música
                <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00F69C]/40 to-transparent" />
              </span>
              ?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
              Junte-se a centenas de escolas que já automatizaram sua gestão e potencializaram o aprendizado dos alunos
              com nossa plataforma.
            </p>
          </div>
        </div>
      </section>
      <section
        ref={triggerRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
        <div className="relative z-0 flex items-center justify-center w-full h-full">
          <img
            ref={imageRef}
            src={Espiral}
            alt="Espiral"
            className="
              w-56 h-56
              sm:w-64 sm:h-64
              md:w-80 md:h-80
              lg:w-[28rem] lg:h-[28rem]
              xl:w-[32rem] xl:h-[32rem]
              object-contain
              rounded-full
            "
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_85%)] z-10 pointer-events-none" />
      </section>
    </>
  );
};

// --- SEÇÃO DE PRICING ---
export const PricingSection = () => {
  const [isPricingHovered, setIsPricingHovered] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"mensal" | "anual">("mensal");
  const WHATSAPP_NUMBER = "5542998005326";
  const SUPPORT_LINK =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Gostaria de saber mais sobre os planos do Autobotize - Gestão Musical. Tenho interesse no plano Professional.")}`;

  const pricing = {
    mensal: { price: "197", period: "/mês", mainColor: "#8000FF", contrastColor: "#00F69C" },
    anual: { price: "1.970", period: "/ano", mainColor: "#00F69C", contrastColor: "#8000FF" },
  };
  const active = pricing[billingCycle];

  useEffect(() => {
    gsap.from("#pricing-card", {
      scrollTrigger: {
        trigger: "#pricing-section",
        start: "top 95%",
      },
      opacity: 0,
      y: 60,
      duration: 1.4,
      ease: "power4.out",
    });
  }, []);

  const handleWhatsApp = () => {
    const cycleLabel = billingCycle === "mensal" ? "Mensal" : "Anual";
    const message = `Olá! Gostaria de saber mais sobre os planos do Autobotize - Gestão Musical. Tenho interesse no plano Professional (${cycleLabel}).`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <section
      id="pricing-section"
      className="relative pt-0 pb-32 bg-black flex flex-col items-center montserrat-font overflow-hidden -mt-20 md:-mt-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(128,0,255,0.06),transparent_70%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[#8000FF] font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Investimento</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-10 tracking-tight uppercase leading-none text-white">
            Tudo o que sua escola <br /> precisa em um{" "}
            <span style={{ color: active.mainColor }} className="transition-colors duration-500">
              único lugar
            </span>
          </h2>
          <div className="flex items-center justify-center gap-4 mb-10">
            <span
              className={`text-sm font-bold uppercase tracking-widest transition-all duration-500 ${billingCycle === "mensal" ? "text-white" : "text-white/40"}`}
            >
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle((prev) => (prev === "mensal" ? "anual" : "mensal"))}
              className="relative w-16 h-8 rounded-full bg-white/5 border border-white/10 p-1"
            >
              <div
                className="w-6 h-6 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: active.mainColor,
                  transform: billingCycle === "anual" ? "translateX(32px)" : "translateX(0px)",
                  boxShadow: `0 0 15px ${active.mainColor}80`,
                }}
              />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold uppercase tracking-widest transition-all duration-500 ${billingCycle === "anual" ? "text-white" : "text-white/40"}`}
              >
                Anual
              </span>
              <span className="bg-[#00F69C]/10 text-[#00F69C] text-[9px] font-black px-2 py-1 rounded-md border border-[#00F69C]/20 uppercase tracking-tighter">
                Economize 20%
              </span>
            </div>
          </div>
        </div>
        <div id="pricing-card" className="max-w-lg mx-auto relative group">
          <div
            className="absolute -inset-20 rounded-[5rem] blur-[110px] opacity-30 group-hover:opacity-100 transition-all duration-1000 animate-neon-pulse pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${active.mainColor}B3, ${active.contrastColor}33, transparent)`,
            }}
          />
          <div className="relative bg-[#050505] border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-2xl backdrop-blur-sm overflow-hidden text-center neon-border-hover">
            <div className="glass-shimmer pointer-events-none" />
            <div className="absolute -top-1 right-12 z-20">
              <div
                className="text-white text-[11px] font-black uppercase px-5 py-2.5 rounded-b-2xl flex items-center gap-1.5 shadow-xl transition-all duration-500"
                style={{ backgroundColor: active.mainColor, boxShadow: `0 10px 30px ${active.mainColor}33` }}
              >
                <SparklesIcon className="w-3.5 h-3.5" /> Professional
              </div>
            </div>
            <div className="mb-12 mt-4 relative z-10 text-white text-center">
              <h3 className="text-4xl font-black mb-4 uppercase tracking-tight">Autobotize Pro</h3>
              <p className="text-gray-400 text-base max-w-xs mx-auto leading-relaxed">
                Acesso total e ilimitado a todas as ferramentas de automação, gestão e IA que você já conheceu.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center mb-12 relative z-10 text-white">
              <div className="flex items-baseline gap-1">
                <span
                  className="text-7xl md:text-8xl font-black tracking-tighter transition-all duration-500 group-hover:scale-105 inline-block"
                  style={{ color: active.mainColor }}
                >
                  R${active.price}
                </span>
                <span className="text-gray-500 font-bold text-lg">{active.period}</span>
              </div>
              <div
                className="mt-4 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-500"
                style={{
                  color: active.contrastColor,
                  borderColor: `${active.contrastColor}4D`,
                  backgroundColor: `${active.contrastColor}0D`,
                  boxShadow: `0 0 20px ${active.contrastColor}1A`,
                }}
              >
                Matrículas e Alunos Ilimitados
              </div>
            </div>
            <button
              onClick={handleWhatsApp}
              onMouseEnter={() => setIsPricingHovered(true)}
              onMouseLeave={() => setIsPricingHovered(false)}
              className="group/btn relative w-full h-20 rounded-2xl font-black text-xl overflow-hidden transition-all duration-500 shadow-2xl active:scale-95 z-10"
              style={{ boxShadow: `0 20px 40px ${active.mainColor}33` }}
            >
              <div
                className={`absolute inset-0 transition-colors duration-500 ${isPricingHovered ? "bg-white" : ""}`}
                style={{ backgroundColor: isPricingHovered ? "white" : active.mainColor }}
              />
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer-btn_2s_infinite]" />
              <div className="relative h-full w-full flex items-center justify-center">
                <span
                  className={`absolute transition-all duration-500 uppercase tracking-widest ${isPricingHovered ? "opacity-0 -translate-y-6" : "opacity-100 translate-y-0 text-white"}`}
                >
                  Começar agora
                </span>
                <span
                  className={`absolute transition-all duration-500 flex items-center gap-3 uppercase tracking-widest ${isPricingHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ color: active.mainColor }}
                >
                  <CheckIcon className="w-6 h-6" /> Ótima Escolha!
                </span>
              </div>
            </button>
            <div className="mt-10 pt-8 border-t border-white/5 relative z-10 flex items-center justify-center gap-6 opacity-80 group-hover:opacity-100 transition-opacity">
              <span
                className="text-[11px] font-black uppercase tracking-widest transition-colors duration-500"
                style={{ color: active.contrastColor, textShadow: `0 0 10px ${active.contrastColor}80` }}
              >
                3 Dias Grátis
              </span>
            </div>
          </div>
        </div>
        <div id="contato-especialista" className="mt-12 text-center relative z-10">
          <div className="inline-flex flex-col md:flex-row items-center gap-2 md:gap-4 px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all duration-500 hover:bg-[#00F69C]/5 hover:border-[#00F69C]/20 hover:scale-105 group cursor-pointer shadow-lg hover:shadow-[#00F69C]/10">
            <span className="text-gray-400 text-sm font-medium tracking-tight">Dúvidas?</span>
            <a
              href={SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#00F69C] font-bold text-sm md:text-base tracking-tight transition-all duration-300 group-hover:brightness-110"
            >
              <MessageIcon className="w-5 h-5 text-[#00F69C] group-hover:rotate-6 transition-transform duration-300" />
              Fale com um especialista
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- NEW FOOTER ---
export const NewFooter = () => {
  const WHATSAPP_NUMBER = "5542998005326";

  return (
    <>
      <svg className="w-0 h-0 absolute">
        <defs>
          <clipPath id="smooth-footer-rounded" clipPathUnits="objectBoundingBox">
            <path d="M 0.04, 0.05 L 0.43, 0.05 L 0.5, 0 L 0.57, 0.05 L 0.96, 0.05 Q 1, 0.05 1, 0.1 L 1, 0.95 Q 1, 1 0.96, 1 L 0.04, 1 Q 0, 1 0, 0.95 L 0, 0.1 Q 0, 0.05 0.04, 0.05" />
          </clipPath>
          <clipPath id="sub-footer-rhombus-rounded" clipPathUnits="objectBoundingBox">
            <path d="M 0.1, 0 L 0.9, 0 Q 0.92, 0 0.91, 0.1 L 0.83, 0.85 Q 0.81, 1 0.75, 1 L 0.25, 1 Q 0.19, 1 0.17, 0.85 L 0.09, 0.1 Q 0.08, 0 0.1, 0 Z" />
          </clipPath>
          <clipPath id="bg-sharp-shape" clipPathUnits="objectBoundingBox">
            <path d="M 0, 0.05 L 0.43, 0.05 L 0.5, 0 L 0.57, 0.05 L 1, 0.05 L 1, 1 L 0, 1 Z" />
          </clipPath>
        </defs>
      </svg>
      <div
        className="w-full bg-gradient-to-b from-black via-[#15002b] to-[#8000FF] p-4 md:p-8 lg:p-10 relative flex flex-col items-center"
        style={{ clipPath: "url(#bg-sharp-shape)" }}
      >
        <footer
          className="w-full bg-[#080808] relative overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-10"
          style={{ clipPath: "url(#smooth-footer-rounded)", marginTop: "-40px" }}
        >
          <div className="pt-28 pb-12 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-6">
              <div className="lg:col-span-6 space-y-12">
                <div className="flex items-center gap-6">
                  <img
                    src={AutobotizeLogo}
                    alt="Autobotize Logo"
                    className="w-16 h-16 rounded-2xl shadow-[0_0_40px_rgba(128,0,255,0.2)] object-cover"
                  />
                  <div className="uppercase">
                    <h2 className="text-3xl font-black italic leading-none tracking-tighter text-white montserrat-font">
                      Autobotize
                    </h2>
                    <p className="text-[#8000FF] text-[10px] font-bold tracking-[0.6em] mt-1 montserrat-font uppercase">
                      Gestão Empresarial
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm max-w-sm leading-relaxed italic font-medium">
                  Sincronizando a gestão administrativa com a paixão pela música. Automação completa para escolas que
                  buscam o próximo nível de excelência sonora e operacional.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-64 gap-y-10">
                  <div className="flex flex-col gap-3 items-start">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 montserrat-font">
                      E-mail
                    </p>
                    <div className="flex gap-4 items-center group cursor-pointer">
                      <MailIcon className="w-5 h-5 text-[#8000FF] group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white border-b border-[#8000FF]/30 pb-1 hover:border-[#8000FF] hover:text-[#8000FF] transition-all montserrat-font whitespace-nowrap">
                        contato@autobotize.com
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-start">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 montserrat-font">
                      WhatsApp
                    </p>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-4 items-center group"
                    >
                      <MessageIcon className="w-5 h-5 text-[#8000FF] group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white border-b border-[#8000FF]/30 pb-1 group-hover:border-[#8000FF] group-hover:text-[#8000FF] transition-all montserrat-font whitespace-nowrap">
                        +55 42 99800-5326
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 grid grid-cols-2 gap-12 pt-4">
                <div className="space-y-8 text-white">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 montserrat-font">
                    Seções
                  </h4>
                  <nav className="flex flex-col gap-2">
                    <FooterLink>Início</FooterLink>
                    <FooterLink>Funcionalidades</FooterLink>
                    <FooterLink>Avaliações</FooterLink>
                    <FooterLink>Investimento</FooterLink>
                  </nav>
                </div>
                <div className="space-y-8 text-white">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 montserrat-font">
                    Social
                  </h4>
                  <nav className="flex flex-col gap-2">
                    <FooterLink>Instagram</FooterLink>
                    <FooterLink>LinkedIn</FooterLink>
                    <FooterLink>YouTube</FooterLink>
                    <FooterLink>Comunidade</FooterLink>
                  </nav>
                </div>
              </div>
            </div>
            <Marquee />
            <div className="pt-8 border-t border-white/5" />
          </div>
        </footer>
        <div className="w-full relative flex justify-center items-start h-8 max-w-[1600px] mx-auto">
          <div className="absolute left-[3px] top-[-2px]">
            <a
              href="#"
              className="text-[12px] font-black uppercase tracking-[0.2em] text-[#080808] hover:text-white transition-colors duration-300 montserrat-font"
            >
              Política de Privacidade
            </a>
          </div>
          <div
            className="w-full max-w-[70%] h-8 bg-[#080808] mt-[-1px] relative z-0 overflow-hidden select-none"
            style={{ clipPath: "url(#sub-footer-rhombus-rounded)" }}
          />
          <div className="absolute right-[10px] top-[5px] text-right">
            <p className="text-[11px] font-black uppercase tracking-[0.05em] text-[#080808] leading-tight montserrat-font">
              © 2026 Autobotize. <br /> Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
