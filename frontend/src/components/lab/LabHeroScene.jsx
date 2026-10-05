import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function disposeObject(object) {
  object.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    const material = node.material;
    if (!material) return;
    const list = Array.isArray(material) ? material : [material];
    list.forEach((item) => item.dispose());
  });
}

export default function LabHeroScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
    camera.position.set(0, 0.2, 6.4);

    const group = new THREE.Group();
    scene.add(group);

    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        emissive: 0x155e75,
        emissiveIntensity: 0.85,
        roughness: 0.35,
        metalness: 0.2,
      })
    );
    group.add(nucleus);

    const proton = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 18, 18),
      new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        emissive: 0x9a3412,
        emissiveIntensity: 0.7,
        roughness: 0.4,
      })
    );
    proton.position.set(0.22, 0.1, 0.12);
    group.add(proton);

    scene.add(new THREE.AmbientLight(0x93c5fd, 0.55));
    const key = new THREE.PointLight(0x22d3ee, 14, 20);
    key.position.set(2.2, 2, 3);
    scene.add(key);
    const fill = new THREE.PointLight(0xfb923c, 7, 16);
    fill.position.set(-3, -1.2, 2);
    scene.add(fill);

    const electronGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const electronMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.1,
    });
    const orbits = [
      { r: 1.55, tilt: 0.35, speed: 0.9 },
      { r: 2.05, tilt: -0.7, speed: 0.65 },
      { r: 2.55, tilt: 1.05, speed: 0.5 },
    ].map((spec, index) => {
      const curve = new THREE.EllipseCurve(0, 0, spec.r, spec.r * 0.52, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(72).map((point) => new THREE.Vector3(point.x, point.y, 0));
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.32 })
      );
      const orbit = new THREE.Group();
      orbit.rotation.x = spec.tilt;
      orbit.rotation.z = index * 0.45;
      orbit.add(line);
      const electron = new THREE.Mesh(electronGeo, electronMat);
      orbit.add(electron);
      group.add(orbit);
      return { electron, r: spec.r, speed: spec.speed, phase: index * 1.7 };
    });

    let frame = 0;
    let running = true;
    const clock = new THREE.Clock();

    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || 640;
      const height = parent?.clientHeight || 420;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement || canvas);

    const onVisibility = () => {
      running = document.visibilityState === 'visible';
      if (running) loop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const loop = () => {
      if (!running) return;
      frame = requestAnimationFrame(loop);
      const time = clock.getElapsedTime();
      group.rotation.y = time * 0.18;
      nucleus.rotation.y = time * 0.35;
      orbits.forEach((orbit) => {
        orbit.phase += orbit.speed * 0.016;
        orbit.electron.position.set(
          Math.cos(orbit.phase) * orbit.r,
          Math.sin(orbit.phase) * orbit.r * 0.52,
          0
        );
      });
      renderer.render(scene, camera);
    };

    resize();
    loop();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      disposeObject(scene);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full min-h-[20rem] w-full"
      aria-hidden="true"
    />
  );
}
