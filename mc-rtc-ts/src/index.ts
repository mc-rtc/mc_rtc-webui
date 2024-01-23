import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ImGui, ImGui_Impl } from '@zhobo63/imgui-ts';
import { unpack } from 'msgpackr/unpack';

import { ControllerClient } from './ControllerClient';

import { Socket, Protocol } from 'nanomsg-browser';

const scene: THREE.Scene = new THREE.Scene();
const socket = new WebSocket("ws://localhost:8080");
const client = new ControllerClient(socket);

const client_socket = new Socket({protocol: Protocol.SUB, reconnectTime: 200, sendArrayBuffer: true, receiveArrayBuffer: true});
client_socket.on('data', (msg) => {
  const data = unpack(msg);
  // Keep this around for debug?
  // console.log('got =>', data);
  client.update(data);
});
client_socket.on('error', (e) => {
  client.update([]);
  console.log('nanomsg error:', e);
});
client_socket.on('end', (url) => {
  console.log('finished', url);
});
client_socket.connect('ws://localhost:8181');

async function initSocket() {
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
        const loader = new GLTFLoader(manager);
        loader.load('dummy', (model) => {
          console.log("ADD MODEL TO SCENE");
          scene.add(model.scene);
        });
        break;
      case 'getGUI':
        const data = unpack(Uint8Array.from(atob(response.data), c => c.charCodeAt(0)));
        client.update(data);
        break;
      default:
        console.log(`Unkwnon response from server ${response.response}`);
    };
  });
}

async function init() {

  await initSocket();

  await ImGui.default();

  ImGui.CreateContext();
  ImGui.StyleColorsDark();

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

  ImGui_Impl.setCanvasScale(1.0);
  ImGui_Impl.Init(canvas);

  function animate(time: DOMHighResTimeStamp) {
    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

    ImGui.Begin("Sample");
    ImGui.Text(`Hello at time ${time}`);
    ImGui.Text(`Want WantCaptureKeyboard: ${ImGui.GetIO().WantCaptureKeyboard}`);
    ImGui.Text(`Want WantCaptureMouse: ${ImGui.GetIO().WantCaptureMouse}`);
    ImGui.End();

    client.draw();

    ImGui.EndFrame();
    ImGui.Render();

    controls.enabled = !ImGui.GetIO().WantCaptureMouse;

    client.draw3d();

    renderer.render(scene, camera);

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    renderer.state.reset();

    window.requestAnimationFrame(animate);
  }
  window.requestAnimationFrame(animate);

  function addShadowedLight(x: number, y: number, z: number, color: THREE.ColorRepresentation, intensity: number) {

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

  const button_model = document.getElementById('button-model');
  button_model.onclick = () => {
    socket.send(JSON.stringify({ "request": "getMesh", "uri": "default" }));
  };

  document.getElementById('button-data').onclick = () => {
    socket.send(JSON.stringify({ 'request': 'getGUI' }));
  };
}
init();
