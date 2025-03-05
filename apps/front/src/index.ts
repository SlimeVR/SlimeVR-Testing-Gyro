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

let currentAngle = { x: 0, y: 0, z: 0 }

onMessage('server/gyro/angles', ({ angles }) => {
  currentAngle = angles;
  setRotation(angles)

  // You can also do it here
  const angleText = document.getElementById("angle-text")!; // <-- whath out for the ! at the end 
  angleText.innerHTML = `Current angle x: ${angles.x} y: ${angles.y} z: ${angles.z}`;
})

const animate = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};


setInterval(() => { // This is to prevent to re render every threejs -> do not update the dom in animate!
  const angleText = document.getElementById("angle-text")!;

  angleText.innerHTML = `Current angle x: ${currentAngle.x} y: ${currentAngle.y} z: ${currentAngle.z}`;
}, 100) // this will run every 100ms


animate();


