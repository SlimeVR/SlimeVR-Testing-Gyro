import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const createFrame = (size: number, color: number) => {
    const points = [
        new THREE.Vector3(0, -size / 2, -size / 2),
        new THREE.Vector3(0, size / 2, -size / 2),
        new THREE.Vector3(0, size / 2, size / 2),
        new THREE.Vector3(0, -size / 2, size / 2),
        new THREE.Vector3(0, -size / 2, -size / 2),
    ];

    const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color })
    );

    return line;
};

export const createThreeScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.up = new THREE.Vector3(0, 0, 1)
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 5);
    controls.update();


    const zFrame = createFrame(4, 0xff0000);
    zFrame.add(
        new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, -4 / 2),
                new THREE.Vector3(0, 0, -4 / 2 - 0.5),
            ]),
            new THREE.LineBasicMaterial({ color: 0xff0000 })
        )
    );
    const yFrame = createFrame(3, 0x00ff00);
    yFrame.add(
        new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, -3 / 2, 0),
                new THREE.Vector3(0, -3 / 2 - 0.5, 0),
            ]),
            new THREE.LineBasicMaterial({ color: 0x00ff00 })
        )
    );
    const xFrame = createFrame(2, 0x0000ff);
    xFrame.add(
        new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, -2 / 2),
                new THREE.Vector3(0, 0, -2 / 2 - 0.5),
            ]),
            new THREE.LineBasicMaterial({ color: 0x0000ff })
        )
    );

    yFrame.add(xFrame);
    zFrame.add(yFrame);
    scene.add(zFrame);


    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        [
            new THREE.MeshBasicMaterial({ color: 'red' }),
            new THREE.MeshBasicMaterial({ color: 'green' }),
            new THREE.MeshBasicMaterial({ color: 'blue' }),
            new THREE.MeshBasicMaterial({ color: 'purple' }),
            new THREE.MeshBasicMaterial({ color: 'gold' }),
            new THREE.MeshBasicMaterial({ color: 'cyan' }),
        ]
    );
    xFrame.add(cube);

    const cube2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        [
            new THREE.MeshBasicMaterial({ color: 'red' }),
            new THREE.MeshBasicMaterial({ color: 'green' }),
            new THREE.MeshBasicMaterial({ color: 'blue' }),
            new THREE.MeshBasicMaterial({ color: 'purple' }),
            new THREE.MeshBasicMaterial({ color: 'gold' }),
            new THREE.MeshBasicMaterial({ color: 'cyan' }),
        ]
    );
    cube2.position.x = 5
    scene.add(cube2);

    return {
        scene,
        renderer,
        xFrame,
        yFrame,
        zFrame,
        cube,
        cube2,
        camera,
        setRotation: ({ x: d, y: b, z: g }: { x: number, y: number, z: number }) => {
            cube2.setRotationFromEuler(new THREE.Euler(d, b, g, 'ZYX')) // Navigational Yaw-Pitch-Roll
            cube.rotation.x = -Math.PI / 2;
            cube.rotation.y = -Math.PI / 2;
            cube.rotation.z = -Math.PI / 2;
            zFrame.rotation.z = g;
            yFrame.rotation.y = b + Math.PI / 2;
            xFrame.rotation.z = d;

        }
    }
}
