import * as THREE from 'three';

import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { GUI } from '../GUI';

export class Mesh {
  private gui: GUI = null;
  private filename: string = '';
  private group: THREE.Group;
  private gltf: GLTF = null;

  constructor(gui: GUI, filename: string, scale: THREE.Vector3) {
    this.gui = gui;
    this.group = new THREE.Group();
    this.update(filename, scale);
  }

  update(filename: string, scale: THREE.Vector3) {
    if (this.filename !== filename) {
      this.cleanup();
      this.filename = filename;
      this.gui.loader.load(`./get_model?path=${filename}`, (gltf) => {
        this.gltf = gltf;
        if (this.gltf) {
          this.gltf.scene.rotateX(3.14 / 2);
          this.group.add(this.gltf.scene);
          this.gui.scene.add(this.group);
        }
      });
    }
  }

  get quaternion() {
    if (this.gltf) {
      return this.group.quaternion;
    }
    return new THREE.Quaternion();
  }

  get position() {
    if (this.gltf) {
      return this.group.position;
    }
    return new THREE.Vector3();
  }

  cleanup() {
    if (this.gltf) {
      this.group.remove(this.gltf.scene);
      this.gui.scene.remove(this.group);
    }
  }

  setColor() {}
}
