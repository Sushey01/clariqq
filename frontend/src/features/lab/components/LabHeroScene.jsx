import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function dispose(object) {
  object.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    const material = node.material;
    if (!material) return;
    (Array.isArray(material) ? material : [material]).forEach((item) => item.dispose());
  });
}

function makePanelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#082028';
  ctx.fillRect(0, 0, 512, 384);
  ctx.strokeStyle = 'rgba(46,230,197,0.35)';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 368);
  ctx.fillStyle = '#6d8f88';
  ctx.font = '22px Inter, sans-serif';
  ctx.fillText('SOCRATIC ENGINE LIVE CONCEPT PULSE', 28, 48);
  const gap = 18;
  const size = 84;
  const originX = 48;
  const originY = 86;
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      ctx.fillStyle = '#06141a';
      ctx.strokeStyle = 'rgba(46,230,197,0.28)';
      ctx.lineWidth = 3;
      const x = originX + col * (size + gap);
      const y = originY + row * (size + gap);
      ctx.fillRect(x, y, size, size);
      ctx.strokeRect(x, y, size, size);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(0.2, 0.55, 7.4);

    const root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xa5f3e4, 0.55));
    const key = new THREE.PointLight(0x2ee6c5, 18, 24);
    key.position.set(2.4, 2.2, 3.2);
    scene.add(key);
    const fill = new THREE.PointLight(0x67e8f9, 8, 18);
    fill.position.set(-3, -0.6, 2);
    scene.add(fill);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x5eead4,
        emissive: 0x115e59,
        emissiveIntensity: 0.55,
        roughness: 0.28,
        metalness: 0.18,
      })
    );
    sphere.position.set(-0.35, 0.15, 0);
    root.add(sphere);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2ee6c5,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.012, 8, 80), ringMat);
    ringA.rotation.x = 1.15;
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.01, 8, 80), ringMat.clone());
    ringB.rotation.x = 0.55;
    ringB.rotation.z = 0.7;
    root.add(ringA, ringB);

    const stickGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8);
    const cyanStick = new THREE.Mesh(
      stickGeo,
      new THREE.MeshStandardMaterial({ color: 0x5eead4, emissive: 0x134e4a, emissiveIntensity: 0.4 })
    );
    cyanStick.position.set(-0.95, -1.15, 0.2);
    cyanStick.rotation.z = 0.35;
    const goldStick = new THREE.Mesh(
      stickGeo,
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0x92400e, emissiveIntensity: 0.35 })
    );
    goldStick.position.set(0.15, -1.2, 0.35);
    goldStick.rotation.z = -0.25;
    root.add(cyanStick, goldStick);

    const beadGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const beads = [
      { color: 0x2ee6c5, pos: [1.7, 0.85, 0.4] },
      { color: 0xbae6fd, pos: [1.15, 1.35, -0.2] },
      { color: 0xfde68a, pos: [-1.55, 0.55, 0.55] },
    ].map((spec) => {
      const mesh = new THREE.Mesh(
        beadGeo,
        new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.35 })
      );
      mesh.position.set(...spec.pos);
      root.add(mesh);
      return mesh;
    });

    const panelTex = makePanelTexture();
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 1.55, 0.08),
      new THREE.MeshStandardMaterial({
        map: panelTex,
        emissive: 0x042f2e,
        emissiveIntensity: 0.25,
        roughness: 0.45,
      })
    );
    panel.position.set(1.55, -0.55, 1.15);
    root.add(panel);

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
      const t = clock.getElapsedTime();
      root.rotation.y = Math.sin(t * 0.22) * 0.18;
      root.rotation.x = Math.sin(t * 0.15) * 0.06;
      sphere.rotation.y = t * 0.25;
      ringA.rotation.z = t * 0.2;
      ringB.rotation.y = -t * 0.12;
      panel.position.y = -0.55 + Math.sin(t * 0.9) * 0.16;
      panel.position.x = 1.55 + Math.cos(t * 0.55) * 0.12;
      panel.rotation.y = -0.35 + Math.sin(t * 0.7) * 0.22;
      panel.rotation.x = 0.12 + Math.sin(t * 0.5) * 0.08;
      panel.rotation.z = Math.sin(t * 0.4) * 0.05;
      beads.forEach((bead, index) => {
        bead.position.y += Math.sin(t * 1.4 + index) * 0.002;
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
      panelTex.dispose();
      dispose(scene);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full min-h-[22rem] w-full" aria-hidden="true" />;
}
