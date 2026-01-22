import { vec2, vec3 } from './math';

class Vertex {
  position: Float32Array;
  normal: Float32Array;
  uv: Float32Array;
  
  constructor(x: number, y: number, z: number) {
    this.position = vec3.fromValues(x, y, z);
    this.normal = vec3.create();
    this.uv = vec2.create();
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

export class Geometry {
  vertices: Vertex[] = [];
  faces: Face[] = [];

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
      this.faces.forEach(face => {
        const mAB = this.getMid(face.a, face.b, cache);
        const mBC = this.getMid(face.b, face.c, cache);
        const mCA = this.getMid(face.c, face.a, cache);
        newFaces.push(
          new Face(face.a, mAB, mCA),
          new Face(face.b, mBC, mAB),
          new Face(face.c, mCA, mBC),
          new Face(mAB, mBC, mCA)
        );
      });
      this.faces = newFaces;
    }
    return this;
  }

  getMid(ndxA: number, ndxB: number, cache: Record<string, number>) {
    const key = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`;
    if (cache[key] !== undefined) return cache[key];
    const a = this.vertices[ndxA].position;
    const b = this.vertices[ndxB].position;
    const ndx = this.vertices.length;
    cache[key] = ndx;
    this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
    return ndx;
  }

  spherize(radius = 1) {
    this.vertices.forEach(v => {
      vec3.normalize(v.normal, v.position);
      vec3.scale(v.position, v.normal, radius);
    });
    return this;
  }

  get data() {
    return {
      vertices: new Float32Array(this.vertices.flatMap(v => Array.from(v.position))),
      indices: new Uint16Array(this.faces.flatMap(f => [f.a, f.b, f.c])),
      uvs: new Float32Array(this.vertices.flatMap(v => Array.from(v.uv)))
    };
  }
}

export class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    const verts: [number, number, number][] = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];
    verts.forEach(v => this.addVertex(...v));
    const faces: [number, number, number][] = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];
    faces.forEach(f => this.addFace(...f));
  }
}

export class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super();
    const alpha = (2 * Math.PI) / steps;
    this.addVertex(0, 0, 0);
    this.vertices[0].uv[0] = 0.5;
    this.vertices[0].uv[1] = 0.5;
    
    for (let i = 0; i < steps; ++i) {
      const x = Math.cos(alpha * i);
      const y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      const v = this.vertices[this.vertices.length - 1];
      v.uv[0] = x * 0.5 + 0.5;
      v.uv[1] = y * 0.5 + 0.5;
      if (i > 0) this.addFace(0, i, i + 1);
    }
    this.addFace(0, steps, 1);
  }
}
