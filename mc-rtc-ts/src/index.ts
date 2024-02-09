import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ImGui } from '@zhobo63/imgui-ts';
import { unpack } from 'msgpackr/unpack';

import { ControllerClient } from './ControllerClient';
import { GUI } from './GUI';

import { Socket, Protocol } from 'nanomsg-browser';

let gui: GUI;
const socket = new WebSocket(`ws://${window.location.hostname}:8080`);
const client = new ControllerClient(socket);

const client_socket = new Socket({
  protocol: Protocol.SUB,
  reconnectTime: 200,
  sendArrayBuffer: true,
  receiveArrayBuffer: true
});
client_socket.on('data', (msg) => {
  const data = unpack(msg);
  // Keep this around for debug?
  // console.log('got =>', data);
  client.update(data);
});
client_socket.on('error', (e) => {
  client.update([]);
  console.log('nanomsg error:', JSON.stringify(e));
});
client_socket.on('end', (url) => {
  console.log('finished', url);
});
client_socket.connect(`ws://${window.location.hostname}:8181`);

async function initSocket() {
  socket.binaryType = 'arraybuffer';
  socket.addEventListener('open', (event) => {
    console.log(`Connect event: ${event}`);
  });
  socket.addEventListener('message', (event) => {
    const response = JSON.parse(event.data);
    switch (response.response) {
      case 'getMesh':
        const manager = new THREE.LoadingManager();
        manager.setURLModifier((url) => {
          if (url == 'dummy') {
            return `data:;base64,${response.data}`;
          } else {
            return url;
          }
        });
        const loader = new GLTFLoader(manager);
        loader.load('dummy', (model) => {
          gui.scene.add(model.scene);
        });
        break;
      default:
        console.log(`Unkwnon response from server ${response.response}`);
    }
  });
}

async function init() {
  // ImGui initialization
  await ImGui.default();

  gui = new GUI(client);
  gui.run();
  await initSocket();

  window.addEventListener('resize', () => {
    gui.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
init();
