'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Mouse-parallax wrapper ─── */
function ParallaxGroup({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouse.current.x =  ((e.clientX - r.left) / r.width  - 0.5) * 2;
      mouse.current.y = -((e.clientY - r.top)  / r.height - 0.5) * 2;
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [gl]);

  useFrame(() => {
    group.current.rotation.y += (mouse.current.x * 0.18 - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (mouse.current.y * 0.10 - group.current.rotation.x) * 0.04;
  });

  return <group ref={group}>{children}</group>;
}

/* ─── Central distorted sphere (the "platform core") ─── */
function CoreSphere() {
  const inner = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    inner.current.rotation.y = t * 0.22;
    inner.current.rotation.z = t * 0.08;
  });

  return (
    <Float speed={1.6} floatIntensity={0.35} rotationIntensity={0.45}>
      {/* Distort core */}
      <mesh ref={inner}>
        <sphereGeometry args={[1.25, 64, 64]} />
        <MeshDistortMaterial
          color="#7C3AED"
          distort={0.42}
          speed={2.5}
          metalness={0.75}
          roughness={0.12}
          emissive="#3b0080"
          emissiveIntensity={0.55}
        />
      </mesh>
      {/* Outer ghost layer for glow depth */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#7C3AED"
          transparent
          opacity={0.06}
          emissive="#7C3AED"
          emissiveIntensity={1}
          side={THREE.BackSide}
        />
      </mesh>
    </Float>
  );
}

/* ─── Orbit ring ─── */
interface RingProps {
  radius: number;
  rotation: [number, number, number];
  color?: string;
  opacity?: number;
}
function OrbitRing({ radius, rotation, color = '#0EA5E9', opacity = 0.28 }: RingProps) {
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, 0.009, 8, 120]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        transparent
        opacity={opacity}
        metalness={1}
      />
    </mesh>
  );
}

/* ─── Orbiting coloured tech orb ─── */
interface OrbProps {
  radius: number;
  speed: number;
  offset: number;
  color: string;
  size?: number;
  yBias?: number;
}
function TechOrb({ radius, speed, offset, color, size = 0.15, yBias = 0 }: OrbProps) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.set(
      Math.cos(t) * radius,
      yBias + Math.sin(t * 0.65) * 0.38,
      Math.sin(t) * radius,
    );
    ref.current.rotation.x = t * 1.4;
    ref.current.rotation.y = t;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.95}
        metalness={0.9}
        roughness={0.05}
      />
    </mesh>
  );
}

/* ─── Small floating accent octahedra ─── */
function FloatingAccent({
  position,
  color,
  speed,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.x = clock.getElapsedTime() * speed;
    ref.current.rotation.y = clock.getElapsedTime() * speed * 0.7;
  });
  return (
    <Float speed={0.8 + speed} floatIntensity={0.9} position={position}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} metalness={0.85} roughness={0.1} />
      </mesh>
    </Float>
  );
}

/* ─── Drifting background constellation ─── */
function ConstellationDots() {
  const ref = useRef<THREE.Points>(null!);
  const { positions, count } = useMemo(() => {
    const n = 70;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 5;
    }
    return { positions: arr, count: n };
  }, []);

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.018;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#A78BFA" transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

const TECH_ORBS: OrbProps[] = [
  { radius: 2.2, speed: 0.48, offset: 0,              color: '#61DAFB', yBias:  0.20 },
  { radius: 2.2, speed: 0.48, offset: Math.PI * 0.40, color: '#3178C6', yBias: -0.20 },
  { radius: 2.2, speed: 0.48, offset: Math.PI * 0.80, color: '#68a063', yBias:  0.30 },
  { radius: 2.2, speed: 0.48, offset: Math.PI * 1.20, color: '#F59E0B', yBias: -0.10 },
  { radius: 2.2, speed: 0.48, offset: Math.PI * 1.60, color: '#EC4899', yBias:  0.15 },
  { radius: 3.3, speed: 0.28, offset: 0,              color: '#0EA5E9', yBias:  0.50 },
  { radius: 3.3, speed: 0.28, offset: Math.PI * 0.50, color: '#A78BFA', yBias: -0.40 },
  { radius: 3.3, speed: 0.28, offset: Math.PI,        color: '#34D399', yBias:  0.20 },
  { radius: 3.3, speed: 0.28, offset: Math.PI * 1.50, color: '#F97316', yBias: -0.30 },
];

const ACCENTS = [
  { position: [-3.9,  1.9, -1.0] as [number, number, number], color: '#7C3AED', speed: 0.60 },
  { position: [ 3.9, -1.6, -1.5] as [number, number, number], color: '#0EA5E9', speed: 0.80 },
  { position: [-2.9, -2.9,  0.5] as [number, number, number], color: '#EC4899', speed: 0.50 },
  { position: [ 3.3,  2.9,  0.0] as [number, number, number], color: '#F59E0B', speed: 0.70 },
  { position: [-4.3, -0.6, -2.0] as [number, number, number], color: '#34D399', speed: 0.90 },
];

/* ─── All scene content (inside Canvas — safe for R3F hooks) ─── */
function SceneContents() {
  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[ 4,  4,  4]} intensity={4.0} color="#7C3AED" />
      <pointLight position={[-4, -4,  4]} intensity={2.5} color="#0EA5E9" />
      <pointLight position={[ 0,  5, -2]} intensity={2.0} color="#EC4899" />

      <Stars radius={80} depth={60} count={1600} factor={3} saturation={0.5} fade speed={0.4} />
      <Sparkles count={90} scale={9} size={1.6} speed={0.5} color="#7C3AED" opacity={0.65} />
      <ConstellationDots />

      <ParallaxGroup>
        <CoreSphere />

        {/* Three layered orbit rings at different angles */}
        <OrbitRing radius={2.2} rotation={[Math.PI / 2, 0, 0]}            color="#7C3AED" opacity={0.22} />
        <OrbitRing radius={3.3} rotation={[Math.PI / 3, 0, Math.PI / 5]}  color="#0EA5E9" opacity={0.18} />
        <OrbitRing radius={4.0} rotation={[Math.PI / 5, Math.PI / 6, 0]}  color="#EC4899" opacity={0.14} />

        {TECH_ORBS.map((orb, i) => <TechOrb key={i} {...orb} />)}
        {ACCENTS.map((a,   i) => <FloatingAccent key={i} {...a} />)}
      </ParallaxGroup>
    </>
  );
}

/* ─── Canvas entry point ─── */
export function HeroScene() {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={50} />
      <SceneContents />
    </Canvas>
  );
}
