import { vec2, vec3, quat } from './math';

export class ArcballControl {
  canvas: HTMLCanvasElement;
  isPointerDown = false;
  orientation: Float32Array;
  pointerRotation: Float32Array;
  rotationVelocity = 0;
  rotationAxis: Float32Array;
  snapDirection: Float32Array;
  snapTargetDirection: Float32Array | null = null;
  pPos: Float32Array;
  prevPPos: Float32Array;
  private _rv = 0;
  private _combQ: Float32Array;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.orientation = quat.create();
    this.pointerRotation = quat.create();
    this.rotationAxis = vec3.fromValues(1, 0, 0);
    this.snapDirection = vec3.fromValues(0, 0, 1);
    this.pPos = vec2.create();
    this.prevPPos = vec2.create();
    this._combQ = quat.create();

    canvas.addEventListener('pointerdown', e => {
      const rect = canvas.getBoundingClientRect();
      vec2.set(this.pPos, e.clientX - rect.left, e.clientY - rect.top);
      vec2.copy(this.prevPPos, this.pPos);
      this.isPointerDown = true;
    });

    window.addEventListener('pointerup', () => { this.isPointerDown = false; });

    window.addEventListener('pointermove', e => {
      if (this.isPointerDown) {
        const rect = canvas.getBoundingClientRect();
        vec2.set(this.pPos, e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    canvas.style.touchAction = 'none';
  }

  update(dt: number) {
    const ts = dt / 16.6;
    let snapQ = quat.create();

    if (this.isPointerDown) {
      const p = this.proj(this.pPos);
      const q = this.proj(this.prevPPos);
      if (vec3.squaredDistance(p, q) > 0.00001) {
        this.quatVecs(vec3.normalize(vec3.create(), p), vec3.normalize(vec3.create(), q), this.pointerRotation, 2.0);
        vec2.copy(this.prevPPos, this.pPos);
      }
    } else {
      quat.slerp(this.pointerRotation, this.pointerRotation, new Float32Array([0, 0, 0, 1]), 0.1 * ts);
      if (this.snapTargetDirection) {
        this.quatVecs(this.snapTargetDirection, this.snapDirection, snapQ, 0.08 * ts);
      }
    }

    const comb = quat.multiply(quat.create(), snapQ, this.pointerRotation);
    this.orientation = quat.multiply(quat.create(), comb, this.orientation);
    quat.normalize(this.orientation, this.orientation);

    quat.slerp(this._combQ, this._combQ, comb, 0.7 * ts);
    const s = Math.sqrt(Math.max(0, 1 - this._combQ[3] * this._combQ[3]));
    if (s > 0.001) {
      vec3.set(this.rotationAxis, this._combQ[0] / s, this._combQ[1] / s, this._combQ[2] / s);
      const rv = Math.acos(Math.max(-1, Math.min(1, this._combQ[3]))) / Math.PI;
      this._rv += (rv - this._rv) * 0.4 * ts;
      this.rotationVelocity = this._rv / ts;
    } else {
      this.rotationVelocity = 0;
    }
  }

  quatVecs(a: Float32Array, b: Float32Array, out: Float32Array, f = 1) {
    const dot = vec3.dot(a, b);
    if (dot > 0.99999) {
      quat.set(out, 0, 0, 0, 1);
      return;
    }
    if (dot < -0.99999) {
      const axis = Math.abs(a[0]) > 0.1 ? vec3.fromValues(0, 1, 0) : vec3.fromValues(1, 0, 0);
      const ortho = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), a, axis));
      quat.setAxisAngle(out, ortho, Math.PI * f);
      return;
    }
    const axis = vec3.cross(vec3.create(), a, b);
    const len = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if (len < 0.00001) {
      quat.set(out, 0, 0, 0, 1);
      return;
    }
    vec3.scale(axis, axis, 1 / len);
    quat.setAxisAngle(out, axis, Math.acos(dot) * f);
  }

  proj(pos: Float32Array): Float32Array {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const s = Math.max(w, h);
    const x = (2 * pos[0] - w) / s;
    const y = (2 * pos[1] - h) / s;
    const zSq = x * x + y * y;
    return vec3.fromValues(-x, y, zSq <= 4 ? Math.sqrt(4 - zSq) : 4 / Math.sqrt(zSq));
  }
}
