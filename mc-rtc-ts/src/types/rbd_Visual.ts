import * as THREE from 'three';

export enum GeometryType {
  BOX,
  CYLINDER,
  SPHERE,
  MESH,
  SUPERELLIPSOID,
  UNKNOWN
}

export class GeometryMesh {
  filename: string = '';
  scaleV: THREE.Vector3 = new THREE.Vector3(1, 1, 1);
}

export class GeometryBox {
  size: THREE.Vector3 = new THREE.Vector3();
}

export class GeometryCylinder {
  radius: number = 0;
  length: number = 0;
}

export class GeometrySphere {
  radius: number = 0;
}

export class GeometrySuperellipsoid {
  size: THREE.Vector3 = new THREE.Vector3();
  epsilon1: number = 1;
  epsilon2: number = 1;
}

export type GeometryData =
  | GeometryBox
  | GeometryCylinder
  | GeometryMesh
  | GeometrySphere
  | GeometrySuperellipsoid
  | null;

export class Geometry {
  type: GeometryType = GeometryType.UNKNOWN;
  data: GeometryData = null;
  fromObject(config: any) {
    if (Object.hasOwn(config, 'box')) {
      this.type = GeometryType.BOX;
      this.data = new GeometryBox();
      this.data.size.fromArray(config.box.size);
    } else if (Object.hasOwn(config, 'cylinder')) {
      this.type = GeometryType.CYLINDER;
      this.data = new GeometryCylinder();
      this.data.radius = config.cylinder.radius;
      (<GeometryCylinder>this.data).length = config.cylinder.length;
    } else if (Object.hasOwn(config, 'sphere')) {
      this.type = GeometryType.SPHERE;
      this.data = new GeometrySphere();
      this.data.radius = config.sphere.radius;
    } else if (Object.hasOwn(config, 'mesh')) {
      this.type = GeometryType.MESH;
      this.data = new GeometryMesh();
      this.data.filename = config.mesh.filename;
      this.data.scaleV.fromArray(config.mesh.scaleV);
    } else if (Object.hasOwn(config, 'superellipsoid')) {
      this.type = GeometryType.SUPERELLIPSOID;
      this.data = new GeometrySuperellipsoid();
      this.data.size.fromArray(config.superellipsoid.size);
      (<GeometrySuperellipsoid>this.data).epsilon1 = config.superellipsoid.epsilon1;
      (<GeometrySuperellipsoid>this.data).epsilon2 = config.superellipsoid.epsilon2;
    } else {
      this.type = GeometryType.UNKNOWN;
      this.data = null;
    }
  }
}

export class MaterialColor {
  r: number;
  g: number;
  b: number;
  a: number;

  toArray(): [number, number, number, number] {
    return [this.r, this.g, this.b, this.a];
  }
}

export class MaterialTexture {
  filename: string;
}

export enum MaterialType {
  NONE,
  COLOR,
  TEXTURE
}

export class Material {
  type: MaterialType = MaterialType.NONE;
  data: MaterialColor | MaterialTexture | null = null;

  fromObject(config: any) {
    if (Object.hasOwn(config, 'color')) {
      this.type = MaterialType.COLOR;
      this.data = new MaterialColor();
      this.data.r = config.color.r;
      this.data.g = config.color.g;
      this.data.b = config.color.b;
      this.data.a = config.color.a;
    } else if (Object.hasOwn(config, 'texture')) {
      this.type = MaterialType.TEXTURE;
      this.data = new MaterialTexture();
      this.data.filename = config.texture.filename;
    } else {
      this.type = MaterialType.NONE;
      this.data = null;
    }
    return this;
  }
}

export class rbd_Visual {
  name: string = '';
  origin: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
  geometry: Geometry = new Geometry();
  material: Material = new Material();

  fromObject(config: any) {
    this.name = config.name;
    this.origin = [...config.origin.rotation, ...config.origin.translation];
    this.geometry.fromObject(config.geometry);
    this.material.fromObject(config.material);
    return this;
  }
}
