import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ImGui, ImGui_Impl } from '@zhobo63/imgui-ts';

import { ControllerClient } from './ControllerClient';

import { Box } from './gui/Box';
import { Sphere } from './gui/Sphere';
import { TransformControls } from './gui/TransformControls';

import { Color } from './types/Color';

export class GUI {
  client: ControllerClient;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  camera: THREE.Camera;
  loader: GLTFLoader;
  orbit: OrbitControls;
  controls: TransformControls[] = [];

  box(width: number, height: number, depth: number, color: Color) {
    return new Box(this.scene, width, height, depth, color);
  }

  sphere(radius: number, color: Color) {
    return new Sphere(this.scene, radius, color);
  }

  private sample_window(time: DOMHighResTimeStamp) {
    ImGui.Begin('Sample');
    ImGui.Text(`Hello at time ${time}`);
    ImGui.Text(`Want WantCaptureKeyboard: ${ImGui.GetIO().WantCaptureKeyboard}`);
    ImGui.Text(`Want WantCaptureMouse: ${ImGui.GetIO().WantCaptureMouse}`);
    if (ImGui.Button('Add controled box')) {
      const box = this.box(0.2, 0.2, 0.2, [0, 0, 1, 1]);
      const control: TransformControls = new TransformControls(this.camera, this.renderer.domElement);
      control.attach(box);
      this.scene.add(control);
      this.controls.push(control);
    }
    ImGui.End();
  }

  private animate(time: DOMHighResTimeStamp) {
    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

    this.sample_window(time);

    this.client.draw();

    ImGui.EndFrame();
    ImGui.Render();

    this.orbit.enabled = !ImGui.GetIO().WantCaptureMouse && !this.controls.some((control) => control.dragging);

    this.client.draw3d();

    this.renderer.render(this.scene, this.camera);

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    this.renderer.state.reset();

    window.requestAnimationFrame((time) => this.animate(time));
  }

  run() {
    ImGui.CreateContext();
    ImGui.StyleColorsDark();

    this.scene.background = new THREE.Color(0x72645b);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvas = this.renderer.domElement;
    document.getElementById('mc-rtc-pane').appendChild(this.renderer.domElement);
    this.renderer.shadowMap.enabled = true;

    this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000);
    this.camera.position.set(1.0, 0.15, 1.0);

    this.orbit = new OrbitControls(this.camera, this.canvas);

    this.loader = new GLTFLoader();
    this.loader.load('./models/head.gltf', (gltf) => {
      console.log('Load head');
      this.scene.add(gltf.scene);
    });

    this.scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3));
    this.addShadowedLight(1, 1, 1, 0xffffff, 3.5);
    this.addShadowedLight(0.5, 1, -1, 0xffd500, 3);

    ImGui_Impl.setCanvasScale(1.0);
    ImGui_Impl.Init(this.canvas);

    window.requestAnimationFrame((time) => this.animate(time));
  }

  private addShadowedLight(x: number, y: number, z: number, color: THREE.ColorRepresentation, intensity: number) {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    this.scene.add(directionalLight);

    directionalLight.castShadow = true;

    const d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.bias = -0.002;
  }

  constructor(client: ControllerClient) {
    this.scene = new THREE.Scene();
    this.client = client;
  }
}
