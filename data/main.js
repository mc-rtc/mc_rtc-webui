const socket = new WebSocket("ws://localhost:8080");
socket.binaryType = "arraybuffer";
socket.addEventListener("open", (event) => {
  console.log(`Connect event: ${event}`);
});
socket.addEventListener("message", (event) => {
  const response = JSON.parse(event.data);
  switch (response.response) {
    case 'getMesh':
      const manager = new THREE.LoadingManager();
      manager.setURLModifier((url) => {
        if (url == "dummy") {
          return `data:;base64,${response.data}`;
        }
        else {
          return url;
        }
      });
      //const loader = new STLLoader(manager);
      const loader = new GLTFLoader(manager);
      loader.load('dummy', (model) => {
        console.log("ADD MODEL TO SCENE");
        scene.add(model.scene);
      });
      break;
    default:
      console.log(`Unkwnon response from server ${response.response}`);
  };
});

async function loadData(path) {
};

const button_model = document.getElementById('button-model');
button_model.onclick = () => {
  socket.send(JSON.stringify({ "request": "getMesh", "uri": "default" }));
};

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

async function init() {

  await ImGui.default();

  ImGui.CreateContext();
  ImGui.StyleColorsDark();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x72645b);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const canvas = renderer.domElement;
  document.getElementById('mc-rtc-pane').appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true;

  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  camera.position.set(1.0, 0.15, 1.0);

  const controls = new OrbitControls(camera, canvas);

  const loader = new GLTFLoader();
  loader.load('./models/head.gltf', function(gltf) {
    console.log("Load head");
    scene.add(gltf.scene);
  });

  scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3));
  addShadowedLight(1, 1, 1, 0xffffff, 3.5);
  addShadowedLight(0.5, 1, - 1, 0xffd500, 3);

  ImGui_Impl.Init(canvas);

  function animate(time) {
    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

    ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
    ImGui.SetNextWindowSize(new ImGui.ImVec2(300, 150), ImGui.Cond.FirstUseEver);
    ImGui.Begin("mc_rtc");
    ImGui.Text(`Hello at time ${time}`);
    ImGui.Text(`Want WantCaptureKeyboard: ${ImGui.GetIO().WantCaptureKeyboard}`);
    ImGui.Text(`Want WantCaptureMouse: ${ImGui.GetIO().WantCaptureMouse}`);
    ImGui.End();
    ImGui.End();
    ImGui.EndFrame();

    ImGui.Render();

    controls.enabled = !ImGui.GetIO().WantCaptureMouse;

    renderer.render(scene, camera);

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    renderer.state.reset();

    window.requestAnimationFrame(animate);
  }
  window.requestAnimationFrame(animate);

  function addShadowedLight(x, y, z, color, intensity) {

    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);

    directionalLight.castShadow = true;

    const d = 1;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.bias = - 0.002;

  }
}
init();
