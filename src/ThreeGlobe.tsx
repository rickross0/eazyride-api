import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function ThreeGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL check
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setError('WebGL not supported');
        return;
      }
    } catch {
      setError('WebGL check failed');
      return;
    }

    let animId = 0;
    let disposed = false;

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0a1428');

      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.z = 4.5;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);

      // Main globe
      const globeGeo = new THREE.SphereGeometry(1.4, 64, 64);
      const globeMat = new THREE.MeshStandardMaterial({
        color: '#ffd700',
        metalness: 0.6,
        roughness: 0.3,
        emissive: '#b8860b',
        emissiveIntensity: 0.2,
      });
      const globe = new THREE.Mesh(globeGeo, globeMat);
      scene.add(globe);

      // Inner glow
      const glowGeo = new THREE.SphereGeometry(1.42, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({ color: '#ffd700', transparent: true, opacity: 0.08, side: THREE.BackSide });
      scene.add(new THREE.Mesh(glowGeo, glowMat));

      // Somalia marker (small sphere on surface)
      const markerGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const markerMat = new THREE.MeshStandardMaterial({ color: '#cd7f32', metalness: 0.8, roughness: 0.2 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(0.75, 0.55, 1.05);
      scene.add(marker);

      // Laascaanod beam
      const beamGeo = new THREE.CylinderGeometry(0.02, 0.1, 1.4, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color: '#00bcd4', transparent: true, opacity: 0.6 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0.75, 1.1, 1.05);
      scene.add(beam);

      // Ring around marker
      const ringGeo = new THREE.RingGeometry(0.28, 0.33, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: '#00bcd4', transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0.75, 0.55, 1.05);
      ring.rotation.x = -0.3;
      scene.add(ring);

      // Orbit rings
      const orbit1Geo = new THREE.RingGeometry(2.0, 2.05, 64);
      const orbit1Mat = new THREE.MeshBasicMaterial({ color: '#00bcd4', transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
      orbit1.rotation.x = Math.PI / 2;
      scene.add(orbit1);

      const orbit2Geo = new THREE.RingGeometry(2.4, 2.45, 64);
      const orbit2Mat = new THREE.MeshBasicMaterial({ color: '#ffd700', transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
      orbit2.rotation.x = Math.PI / 3;
      scene.add(orbit2);

      // Stars
      for (let i = 0; i < 80; i++) {
        const starGeo = new THREE.BoxGeometry(0.03, 0.03, 0.03);
        const starMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? '#ffd700' : '#00bcd4' });
        const star = new THREE.Mesh(starGeo, starMat);
        const r = 3 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        star.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        scene.add(star);
      }

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const p1 = new THREE.PointLight(0xffd700, 1);
      p1.position.set(5, 5, 5);
      scene.add(p1);
      const p2 = new THREE.PointLight(0x00bcd4, 0.5);
      p2.position.set(-5, -3, 2);
      scene.add(p2);

      const animate = () => {
        if (disposed) return;
        animId = requestAnimationFrame(animate);
        globe.rotation.y += 0.003;
        globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, mouseRef.current.y * 0.15, 0.05);
        beam.scale.y = 1 + Math.sin(Date.now() * 0.003) * 0.3;
        beam.material.opacity = 0.4 + Math.sin(Date.now() * 0.002) * 0.3;
        orbit1.rotation.z += 0.001;
        orbit2.rotation.z -= 0.0005;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        disposed = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        globeGeo.dispose();
        globeMat.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (err: any) {
      setError(err?.message || 'WebGL error');
    }
  }, []);

  return (
    <div className="w-full relative">
      <div className="absolute top-4 left-4 z-10 text-gold text-sm font-bold bg-navy-900/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-gold/30 pointer-events-none">
        🌍 3D Somalia — Drag to explore
      </div>
      {error ? (
        <div className="w-full h-[60vh] md:h-[80vh] bg-navy-900 flex items-center justify-center text-gold">
          <div className="text-center">
            <p className="text-6xl mb-4">🌍</p>
            <p className="text-xl font-bold">Somalia 3D Globe</p>
            <p className="text-sm text-gray-400 mt-2">{error}. Enable WebGL to see the 3D experience.</p>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="w-full h-[60vh] md:h-[80vh] bg-navy-900 cursor-move"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            mouseRef.current = {
              x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
              y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
            };
          }}
        />
      )}
    </div>
  );
}
