"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export function CarAnimation() {
  const mainContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainContainer = mainContainerRef.current;
    if (!mainContainer) return;

    let renderer: THREE.WebGLRenderer;
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let grid: THREE.GridHelper;
    let controls: OrbitControls;
    const wheels: THREE.Object3D[] = [];

    const getSize = () => ({
      width: Math.max(mainContainer.clientWidth, 1),
      height: Math.max(mainContainer.clientHeight, 1),
    });

    const initialization = () => {
      const { width, height } = getSize();

      renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      renderer.setAnimationLoop(animate);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      mainContainer.appendChild(renderer.domElement);

      // Setting upn the camera
      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(4.25, 1.4, -4.5);

      // Setting up controls

      controls = new OrbitControls(camera, renderer.domElement);
      controls.maxDistance = 9;
      controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
      controls.target.set(0, 0.5, 0);
      controls.update();

      // Setting up the scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x333333);
      scene.environment = new RGBELoader().load("/car/venice_sunset_1k.hdr");
      scene.environment.mapping = THREE.EquirectangularReflectionMapping;
      scene.fog = new THREE.Fog(0x333333, 10, 15);

      // grid setup

      grid = new THREE.GridHelper(20, 40, 0xffffff, 0xffffff);
      grid.material.opacity = 0.2;
      grid.material.depthWrite = false;
      grid.material.transparent = true;
      scene.add(grid);

      // material setup
      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        metalness: 1.0,
        roughness: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
      });

      const detailMaterial = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.5,
        metalness: 1.0,
      });

      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 0.25,
        roughness: 0,
        transmission: 1.0,
      });

      const shadow = new THREE.TextureLoader().load("/car/ferrari_ao.png");

      // Draco compression with gltf loader
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/car/compressor/gltf/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      // load 3D model
      loader.load("/car/ferrari.glb", (gltf) => {
        const carModel = gltf.scene;
        console.log("car model", carModel);

        const body = carModel.getObjectByName("body") as THREE.Mesh;
        if (body) body.material = bodyMaterial;

        ["rim_f1", "rim_fr", "rim_bl", "rim_br"].forEach((name) => {
          const rim = carModel.getObjectByName(name) as THREE.Mesh;
          if (rim) rim.material = detailMaterial;
        });

        const glass = carModel.getObjectByName("glass") as THREE.Mesh;
        if (glass) glass.material = glassMaterial;

        wheels.push(
          carModel.getObjectByName("wheel_f1"),
          carModel.getObjectByName("wheel_fr"),
          carModel.getObjectByName("wheel_bl"),
          carModel.getObjectByName("wheel_br"),
        );

        // creating the mesh

        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
          new THREE.MeshBasicMaterial({
            map: shadow,
            blending: THREE.MultiplyBlending,
            toneMapped: false,
            transparent: true,
          }),
        );

        mesh.rotation.x = Math.PI / 2;
        mesh.renderOrder = 2;

        carModel.add(mesh);
        scene.add(carModel);

        // const car = gltf.scene;
        // car.traverse((child) => {
        //   if (child instanceof THREE.Mesh) {
        //     child.material = bodyMaterial;
        //   }
        // });
      });

      // const wheelMaterial = new THREE.MeshStandardMaterial({
      //   color: 0x222222,
      //   roughness: 0.4,
      //   metalness: 0.05,
      // });
    };

    const animate = () => {
      controls.update();
      const time = performance.now() / 1000;

      wheels.forEach((wheel) => {
        if (wheel) wheel.rotation.x = time * Math.PI * 2;
      });

      grid.position.z = time % 1;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    const onResize = () => {
      const { width, height } = getSize();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    initialization();

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mainContainer);

    return () => {
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mainContainer) {
        mainContainer.removeChild(renderer.domElement);
      }

      scene.clear();
    };
  }, []);

  return (
    <div className="w-full">
      <p className="mb-4">Car Animation</p>
      <div
        ref={mainContainerRef}
        className="relative h-[70vh] w-full min-w-0 overflow-hidden rounded-lg"
      />
    </div>
  );
}
