import { useEffect, useRef, useState } from "react";
import { discVertShaderSource, discFragShaderSource } from "./webgl/shaders";
import { vec3, mat4, quat } from "./webgl/math";
import { IcosahedronGeometry, DiscGeometry } from "./webgl/geometry";
import { createProgram } from "./webgl/utils";
import { ArcballControl } from "./webgl/ArcballControl";

interface Testimonial {
  initials: string;
  name: string;
  role: string;
  quote: string;
  color: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    initials: "SV",
    name: "Sandro Volski",
    role: "Proprietário da\nEscola de Música",
    quote: "Zeramos a inadimplência com as cobranças automáticas. O controle financeiro é impecável.",
    color: "#00FFA1",
    image: "https://i.pravatar.cc/300?u=sandro"
  },
  {
    initials: "CS",
    name: "Carlos Santos",
    role: "Professor de Piano",
    quote: "A IA pedagógica é incrível! Sugere repertórios personalizados que meus alunos adoram.",
    color: "#FFFFFF",
    image: "https://i.pravatar.cc/300?u=carlos"
  },
  {
    initials: "MS",
    name: "Maria Silva",
    role: "Proprietária do MusicFlow",
    quote: "Reduzi 70% do tempo gasto com tarefas administrativas. Agora ensino música.",
    color: "#8000FF",
    image: "https://i.pravatar.cc/300?u=maria"
  }
];

export const SocialProofSphere = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeItem, setActiveItem] = useState<Testimonial | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true });
    if (!gl) return;

    const discGeo = new DiscGeometry(64, 1).data;
    const icoGeo = new IcosahedronGeometry().subdivide(1).spherize(2);
    const instancePositions = icoGeo.vertices.map(v => v.position);
    const instanceCount = instancePositions.length;

    const control = new ArcballControl(canvas);
    const initialTarget = vec3.normalize(vec3.create(), instancePositions[0]);
    const startPos = vec3.fromValues(0, 0, 1);
    const axis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), initialTarget, startPos));
    const angle = Math.acos(Math.max(-1, Math.min(1, vec3.dot(initialTarget, startPos))));
    quat.setAxisAngle(control.orientation, axis, angle);
    setActiveItem(testimonials[0]);

    const program = createProgram(gl, discVertShaderSource, discFragShaderSource, {
      aModelPosition: 0,
      aModelUvs: 2,
      aInstanceMatrix: 3
    });
    if (!program) return;

    const locs = {
      uWorldMatrix: gl.getUniformLocation(program, 'uWorldMatrix'),
      uViewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
      uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      uRotationAxisVelocity: gl.getUniformLocation(program, 'uRotationAxisVelocity'),
      uItemCount: gl.getUniformLocation(program, 'uItemCount'),
      uAtlasSize: gl.getUniformLocation(program, 'uAtlasSize'),
      uTex: gl.getUniformLocation(program, 'uTex')
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
      const offC = document.createElement('canvas');
      const ctx = offC.getContext('2d');
      if (!ctx) return;
      
      offC.width = offC.height = atlasSize * cellSize;
      
      for (let i = 0; i < testimonials.length; i++) {
        const t = testimonials[i];
        const x = (i % atlasSize) * cellSize;
        const y = Math.floor(i / atlasSize) * cellSize;
        const cx = x + 256;
        const cy = y + 256;
        
        ctx.save();
        const g = ctx.createRadialGradient(cx, cy, 100, cx, cy, 250);
        g.addColorStop(0, t.color);
        g.addColorStop(1, '#000000');
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
          ctx.fillStyle = (t.color === "#FFFFFF" ? "#000" : "#FFF");
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
    
    Promise.all(testimonials.map(t => {
      return new Promise<HTMLImageElement | null>(res => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = t.image;
        img.onload = () => res(img);
        img.onerror = () => res(null);
      });
    })).then(imgs => drawAtlas(imgs));

    const viewM = mat4.create();
    const projM = mat4.create();
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
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
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
        const targetWorldPos = vec3.transformQuat(vec3.create(), targetLocalPos, control.orientation);

        const safeTarget = vec3.normalize(vec3.create(), targetWorldPos);
        if (safeTarget[0] === 0 && safeTarget[1] === 0 && safeTarget[2] === 0) {
          control.snapTargetDirection = vec3.fromValues(0, 0, 1);
        } else {
          control.snapTargetDirection = safeTarget;
        }

        const invQ = quat.conjugate(quat.create(), control.orientation);
        const forwardVecOnSphere = vec3.transformQuat(vec3.create(), new Float32Array([0, 0, 1]), invQ);

        let maxD = -1, nearest = 0;
        instancePositions.forEach((pos, i) => {
          const d = vec3.dot(forwardVecOnSphere, pos);
          if (d > maxD) { maxD = d; nearest = i; }
        });

        const index = nearest % testimonials.length;
        setActiveItem(testimonials[index]);
      } else {
        const invQ = quat.conjugate(quat.create(), control.orientation);
        const forwardVecOnSphere = vec3.transformQuat(vec3.create(), new Float32Array([0, 0, 1]), invQ);
        let maxD = -1, nearest = 0;
        instancePositions.forEach((pos, i) => {
          const d = vec3.dot(forwardVecOnSphere, pos);
          if (d > maxD) { maxD = d; nearest = i; }
        });
        currentVtxIndex = nearest;
        camZ += (5 + control.rotationVelocity * 40 - camZ) * 0.1;
      }

      if (!control.isPointerDown) camZ += (4.2 - camZ) * 0.08;

      mat4.perspective(projM, Math.PI / 4.5, canvas.width / canvas.height, 0.1, 100);
      mat4.invert(viewM, mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, camZ)));
      
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(program);

      instancePositions.forEach((pos, i) => {
        const worldP = vec3.transformQuat(vec3.create(), pos, control.orientation);
        const s = (Math.abs(worldP[2]) / 2) * 0.6 + 0.4;
        const m = mat4.create();
        mat4.multiply(m, m, mat4.targetTo(mat4.create(), worldP, [0, 0, 0], [0, 1, 0]));
        mat4.multiply(m, m, mat4.fromScaling(mat4.create(), vec3.fromValues(0.3 * s, 0.3 * s, 0.3 * s)));
        for (let j = 0; j < 16; j++) matricesData[i * 16 + j] = m[j];
      });
      
      gl.bindBuffer(gl.ARRAY_BUFFER, instB);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, matricesData);

      gl.uniformMatrix4fv(locs.uWorldMatrix, false, mat4.create());
      gl.uniformMatrix4fv(locs.uViewMatrix, false, viewM);
      gl.uniformMatrix4fv(locs.uProjectionMatrix, false, projM);
      gl.uniform4f(locs.uRotationAxisVelocity, control.rotationAxis[0], control.rotationAxis[1], control.rotationAxis[2], control.rotationVelocity || 0);
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
    <div className="relative w-full min-h-[85vh] md:min-h-screen bg-black flex flex-col items-center select-none py-16 overflow-hidden font-sans">
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
          <div className={`transition-all duration-1000 ease-out ${isMoving || !activeItem ? 'opacity-0 -translate-y-8 scale-90' : 'opacity-100 translate-y-0 scale-100'}`}>
            {activeItem && (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
                  <span className="text-white/40 font-bold text-[10px] uppercase tracking-[0.6em]">Membro Verificado</span>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
                </div>
                <h2 className="text-white text-3xl md:text-5xl font-black tracking-tighter leading-none mb-2">
                  {activeItem.name.split(' ')[0]} <span style={{ color: activeItem.color }} className="italic font-light">{activeItem.name.split(' ').slice(1).join(' ')}</span>
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
          <div className={`transition-all duration-1000 ease-in-out p-6 rounded-3xl backdrop-blur-md bg-white/[0.01] ${isMoving || !activeItem ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
            {activeItem && (
              <div className="relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl text-[#00FFA1] opacity-20 font-serif">"</span>
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
