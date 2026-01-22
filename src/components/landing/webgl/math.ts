export const vec2 = {
  create: () => new Float32Array(2),
  set: (out: Float32Array, x: number, y: number) => { out[0] = x; out[1] = y; return out; },
  copy: (out: Float32Array, a: Float32Array) => { out[0] = a[0]; out[1] = a[1]; return out; },
  sub: (out: Float32Array, a: Float32Array, b: Float32Array) => { out[0] = a[0] - b[0]; out[1] = a[1] - b[1]; return out; },
  scale: (out: Float32Array, a: Float32Array, b: number) => { out[0] = a[0] * b; out[1] = a[1] * b; return out; },
  add: (out: Float32Array, a: Float32Array, b: Float32Array) => { out[0] = a[0] + b[0]; out[1] = a[1] + b[1]; return out; },
  sqrLen: (a: Float32Array) => a[0] * a[0] + a[1] * a[1]
};

export const vec3 = {
  create: () => new Float32Array(3),
  fromValues: (x: number, y: number, z: number) => new Float32Array([x, y, z]),
  set: (out: Float32Array, x: number, y: number, z: number) => { out[0] = x; out[1] = y; out[2] = z; return out; },
  normalize: (out: Float32Array, a: Float32Array) => {
    let x = a[0], y = a[1], z = a[2], len = x * x + y * y + z * z;
    if (len > 0) len = 1 / Math.sqrt(len);
    else len = 0;
    out[0] = x * len; out[1] = y * len; out[2] = z * len;
    return out;
  },
  scale: (out: Float32Array, a: Float32Array, b: number) => { out[0] = a[0] * b; out[1] = a[1] * b; out[2] = a[2] * b; return out; },
  cross: (out: Float32Array, a: Float32Array, b: Float32Array) => {
    let ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];
    out[0] = ay * bz - az * by; out[1] = az * bx - ax * bz; out[2] = ax * by - ay * bx;
    return out;
  },
  dot: (a: Float32Array, b: Float32Array) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  negate: (out: Float32Array, a: Float32Array) => { out[0] = -a[0]; out[1] = -a[1]; out[2] = -a[2]; return out; },
  transformQuat: (out: Float32Array, a: Float32Array, q: Float32Array) => {
    let qx = q[0], qy = q[1], qz = q[2], qw = q[3], x = a[0], y = a[1], z = a[2];
    let uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
    let uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
    let w2 = qw * 2;
    out[0] = x + (uvx * w2) + (uuvx * 2); out[1] = y + (uvy * w2) + (uuvy * 2); out[2] = z + (uvz * w2) + (uuvz * 2);
    return out;
  },
  squaredDistance: (a: Float32Array, b: Float32Array) => {
    let x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2];
    return x * x + y * y + z * z;
  }
};

export const mat4 = {
  create: () => {
    let out = new Float32Array(16); out[0] = out[5] = out[10] = out[15] = 1; return out;
  },
  fromScaling: (out: Float32Array, v: Float32Array) => {
    out[0] = v[0]; out[5] = v[1]; out[10] = v[2]; out[15] = 1;
    out[1] = out[2] = out[3] = out[4] = out[6] = out[7] = out[8] = out[9] = out[11] = out[12] = out[13] = out[14] = 0;
    return out;
  },
  fromTranslation: (out: Float32Array, v: Float32Array) => {
    out[0] = out[5] = out[10] = out[15] = 1; out[12] = v[0]; out[13] = v[1]; out[14] = v[2]; return out;
  },
  multiply: (out: Float32Array, a: Float32Array, b: Float32Array) => {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30; out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31; out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32; out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30; out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31; out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32; out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30; out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31; out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32; out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30; out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31; out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32; out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  },
  invert: (out: Float32Array, a: Float32Array) => {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return null; det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det; out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det; out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det; out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det; out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  },
  perspective: (out: Float32Array, fovy: number, aspect: number, near: number, far: number) => {
    let f = 1.0 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out[0] = f / aspect; out[5] = f; out[10] = (far + near) * nf; out[11] = -1; out[14] = (2 * far * near) * nf; out[15] = 0;
    return out;
  },
  targetTo: (out: Float32Array, eye: Float32Array, target: number[], up: number[]) => {
    let eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2], len = z0 * z0 + z1 * z1 + z2 * z2;
    if (len > 0) { len = 1 / Math.sqrt(len); z0 *= len; z1 *= len; z2 *= len; }
    let x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
    len = x0 * x0 + x1 * x1 + x2 * x2; if (len > 0) { len = 1 / Math.sqrt(len); x0 *= len; x1 *= len; x2 *= len; }
    out[0] = x0; out[1] = x1; out[2] = x2; out[3] = 0; out[4] = z1 * x2 - z2 * x1; out[5] = z2 * x0 - z0 * x2; out[6] = z0 * x1 - z1 * x0; out[7] = 0; out[8] = z0; out[9] = z1; out[10] = z2; out[11] = 0; out[12] = eyex; out[13] = eyey; out[14] = eyez; out[15] = 1;
    return out;
  },
  copy: (out: Float32Array, a: Float32Array) => { for (let i = 0; i < 16; i++) out[i] = a[i]; return out; }
};

export const quat = {
  create: () => new Float32Array([0, 0, 0, 1]),
  set: (out: Float32Array, x: number, y: number, z: number, w: number) => { out[0] = x; out[1] = y; out[2] = z; out[3] = w; return out; },
  setAxisAngle: (out: Float32Array, axis: Float32Array, rad: number) => {
    rad = rad * 0.5; let s = Math.sin(rad);
    out[0] = s * axis[0]; out[1] = s * axis[1]; out[2] = s * axis[2]; out[3] = Math.cos(rad);
    return out;
  },
  multiply: (out: Float32Array, a: Float32Array, b: Float32Array) => {
    let ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];
    out[0] = ax * bw + aw * bx + ay * bz - az * by; out[1] = ay * bw + aw * by + az * bx - ax * bz; out[2] = az * bw + aw * bz + ax * by - ay * bx; out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  },
  normalize: (out: Float32Array, a: Float32Array) => {
    let x = a[0], y = a[1], z = a[2], w = a[3], len = x * x + y * y + z * z + w * w;
    if (len > 0) { len = 1 / Math.sqrt(len); out[0] = x * len; out[1] = y * len; out[2] = z * len; out[3] = w * len; }
    return out;
  },
  slerp: (out: Float32Array, a: Float32Array, b: Float32Array, t: number) => {
    let ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3], cosom = ax * bx + ay * by + az * bz + aw * bw;
    if (cosom < 0) { cosom = -cosom; bx = -bx; by = -by; bz = -bz; bw = -bw; }
    let scale0, scale1;
    if ((1.0 - cosom) > 0.000001) {
      let omega = Math.acos(cosom), sinom = Math.sin(omega);
      scale0 = Math.sin((1.0 - t) * omega) / sinom; scale1 = Math.sin(t * omega) / sinom;
    } else { scale0 = 1.0 - t; scale1 = t; }
    out[0] = scale0 * ax + scale1 * bx; out[1] = scale0 * ay + scale1 * by; out[2] = scale0 * az + scale1 * bz; out[3] = scale0 * aw + scale1 * bw;
    return out;
  },
  conjugate: (out: Float32Array, a: Float32Array) => { out[0] = -a[0]; out[1] = -a[1]; out[2] = -a[2]; out[3] = a[3]; return out; }
};
