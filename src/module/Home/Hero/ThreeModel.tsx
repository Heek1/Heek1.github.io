"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const MODEL_URL = "/3d/abstract_figure_twist.glb";
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 7, 18);

type Props = {
  className?: string;
};

export default function ThreeModel({ className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // WebGL is unavailable (old device or disabled GPU): keep the hero without the 3D model.
      return;
    }

    let disposed = false;
    let rafId: number | null = null;
    let visible = true;
    let isDragging = false;
    let model: THREE.Object3D | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.copy(DEFAULT_CAMERA_POSITION);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resize();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minAzimuthAngle = -Math.PI / 4;
    controls.maxAzimuthAngle = Math.PI / 4;
    controls.addEventListener("start", () => (isDragging = true));
    controls.addEventListener("end", () => (isDragging = false));
    // OrbitControls blocks all touch gestures; let vertical swipes scroll the page on phones.
    renderer.domElement.style.touchAction = "pan-y";

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x404040, 1));

    // Procedural studio lighting: no external HDR download needed.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTexture = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    scene.environment = envTexture;

    const material = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 1.0,
      roughness: 0.2,
      envMapIntensity: 1.2,
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const frame = () => {
      controls.update();
      if (model && !isDragging && !reducedMotion.matches) {
        camera.position.lerp(DEFAULT_CAMERA_POSITION, 0.03);
        model.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (rafId === null && visible && model && !disposed) rafId = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    // Pause rendering while the model is off-screen to save CPU/GPU and battery.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    intersectionObserver.observe(mount);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        const loaded = gltf.scene;
        loaded.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const old = Array.isArray(child.material) ? child.material : [child.material];
            old.forEach((m) => m.dispose());
            child.material = material;
          }
        });

        if (disposed) {
          disposeObject(loaded);
          return;
        }

        const box = new THREE.Box3().setFromObject(loaded);
        const center = new THREE.Vector3();
        box.getCenter(center);
        loaded.position.sub(center);
        loaded.scale.setScalar(1.25);

        scene.add(loaded);
        model = loaded;
        start();
      },
      undefined,
      (error) => console.error("Failed to load 3D model", error)
    );

    return () => {
      disposed = true;
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      controls.dispose();
      if (model) disposeObject(model);
      material.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div className={className} ref={mountRef} />;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) child.geometry.dispose();
  });
}
