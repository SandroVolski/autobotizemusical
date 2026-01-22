export function createShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : (console.error(gl.getShaderInfoLog(s)), null);
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vs: string,
  fs: string,
  attribs?: Record<string, number>
): WebGLProgram | null {
  const p = gl.createProgram();
  if (!p) return null;
  
  const vertShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
  
  if (!vertShader || !fragShader) return null;
  
  gl.attachShader(p, vertShader);
  gl.attachShader(p, fragShader);
  
  if (attribs) {
    Object.keys(attribs).forEach(k => gl.bindAttribLocation(p, attribs[k], k));
  }
  
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : (console.error(gl.getProgramInfoLog(p)), null);
}
