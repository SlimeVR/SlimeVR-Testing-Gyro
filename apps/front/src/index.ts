import { createThreeScene } from "./threejs-scene";
import { createWebsocketClient } from "./websockets";

const {
  scene,
  camera,
  renderer,
  setRotation
} = createThreeScene()

const {
  onMessage,
} = createWebsocketClient()

onMessage('server/gyro/angles', ({ angles }) => {
  // console.log('angles', angles)
  setRotation(angles)
})

const animate = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();


