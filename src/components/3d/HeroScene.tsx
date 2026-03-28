'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, RoundedBox, Sparkles, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

interface TechBadgeProps {
  label: string;
  glyph: string;
  color: string;
  angleOffset: number;
  radius: number;
  speed: number;
}

interface ProjectCardProps {
  position: [number, number, number];
  tint: string;
  speed: number;
}

const TECH_BADGES: Array<Omit<TechBadgeProps, 'angleOffset'>> = [
  { label: 'React', glyph: 'R', color: '#61DAFB', radius: 3.3, speed: 0.22 },
  { label: 'Next.js', glyph: 'N', color: '#F8FAFC', radius: 3.3, speed: 0.22 },
  { label: 'Node.js', glyph: 'Nd', color: '#68A063', radius: 3.3, speed: 0.22 },
  { label: 'MongoDB', glyph: 'M', color: '#00ED64', radius: 3.3, speed: 0.22 },
  { label: 'TypeScript', glyph: 'TS', color: '#3178C6', radius: 3.3, speed: 0.22 },
];

const PROJECT_CARD_CONFIGS: ProjectCardProps[] = [
  { position: [-2.3, 1.3, -0.9], tint: '#7C3AED', speed: 0.55 },
  { position: [2.5, -0.6, -1.1], tint: '#0EA5E9', speed: 0.75 },
  { position: [-1.9, -1.6, -1.4], tint: '#F59E0B', speed: 0.6 },
];

function SceneRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const targetX = state.pointer.y * 0.15;
    const targetY = state.pointer.x * 0.28 + t * 0.09;

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3.5, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, Math.sin(t * 0.7) * 0.06, 2.5, delta);
  });

  return <group ref={group}>{children}</group>;
}

function PortfolioMockup() {
  const ref = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = Math.sin(t * 1.05) * 0.1;
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.03;
  });

  return (
    <group ref={ref}>
      <RoundedBox args={[3.6, 2.3, 0.12]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color="#090E1B" metalness={0.75} roughness={0.24} />
      </RoundedBox>

      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[3.3, 2.0]} />
        <meshStandardMaterial color="#0F172A" emissive="#1D4ED8" emissiveIntensity={0.08} />
      </mesh>

      <mesh position={[-0.9, 0.74, 0.08]}>
        <planeGeometry args={[1.15, 0.17]} />
        <meshStandardMaterial color="#A78BFA" emissive="#7C3AED" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[0.72, 0.75, 0.08]}>
        <planeGeometry args={[0.62, 0.12]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {[-0.95, -0.15, 0.64].map((x, i) => (
        <group key={i} position={[x, -0.15, 0.08]}>
          <mesh>
            <planeGeometry args={[0.85, 1.1]} />
            <meshStandardMaterial color="#111C2E" />
          </mesh>
          <mesh position={[0, 0.36, 0.01]}>
            <planeGeometry args={[0.55, 0.13]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0.12, 0.01]}>
            <planeGeometry args={[0.6, 0.06]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, -0.03, 0.01]}>
            <planeGeometry args={[0.66, 0.06]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[-0.23, -0.35, 0.01]}>
            <planeGeometry args={[0.2, 0.12]} />
            <meshStandardMaterial color="#0EA5E9" emissive="#0EA5E9" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -1.45, -0.02]}>
        <cylinderGeometry args={[0.08, 0.08, 0.65, 18]} />
        <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -1.83, -0.02]}>
        <cylinderGeometry args={[0.8, 0.55, 0.07, 24]} />
        <meshStandardMaterial color="#0B1220" metalness={0.9} roughness={0.16} />
      </mesh>
    </group>
  );
}

function TechBadge({ label, glyph, color, angleOffset, radius, speed }: TechBadgeProps) {
  const ref = useRef<THREE.Group>(null!);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime() * speed + angleOffset;
    ref.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t * 1.35) * 0.7,
      Math.sin(t) * radius,
    );
    ref.current.lookAt(camera.position);
  });

  return (
    <group ref={ref}>
      <RoundedBox args={[1.12, 0.34, 0.08]} radius={0.09} smoothness={4}>
        <meshStandardMaterial color="#111827" emissive={color} emissiveIntensity={0.22} metalness={0.25} roughness={0.35} />
      </RoundedBox>
      <mesh position={[-0.35, 0, 0.05]}>
        <circleGeometry args={[0.12, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
      </mesh>
      <Text position={[-0.35, 0, 0.07]} fontSize={0.075} color="#0B1220" anchorX="center" anchorY="middle">
        {glyph}
      </Text>
      <Text position={[0, 0, 0.05]} fontSize={0.12} color={color} anchorX="center" anchorY="middle" maxWidth={1}>
        {label}
      </Text>
    </group>
  );
}

function ProjectCard({ position, tint, speed }: ProjectCardProps) {
  const ref = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed) * 0.18;
    ref.current.rotation.y = Math.sin(t * speed * 0.7) * 0.28;
    ref.current.rotation.x = Math.cos(t * speed * 0.6) * 0.1;
  });

  return (
    <group ref={ref} position={position}>
      <RoundedBox args={[1.28, 0.88, 0.1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#0B1528" metalness={0.48} roughness={0.24} emissive={tint} emissiveIntensity={0.16} />
      </RoundedBox>

      <mesh position={[0, 0.2, 0.06]}>
        <planeGeometry args={[0.75, 0.1]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[0.88, 0.06]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, -0.16, 0.06]}>
        <planeGeometry args={[0.65, 0.06]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

function OrbitalRings() {
  const ringRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ringRef.current.rotation.y = t * 0.08;
    ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.05;
  });

  return (
    <group ref={ringRef}>
      <mesh rotation={[Math.PI / 2.2, 0, 0.2]}>
        <torusGeometry args={[3.25, 0.01, 8, 140]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.65} transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2.8, Math.PI / 8, -0.2]}>
        <torusGeometry args={[2.6, 0.008, 8, 120]} />
        <meshStandardMaterial color="#0EA5E9" emissive="#0EA5E9" emissiveIntensity={0.65} transparent opacity={0.24} />
      </mesh>
    </group>
  );
}

function SceneContents({ isMobile }: { isMobile: boolean }) {
  const { positions } = useMemo(() => {
    const pointCount = isMobile ? 40 : 80;
    const arr = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      const seed = i * 12.9898;
      arr[i * 3] = Math.sin(seed) * 8;
      arr[i * 3 + 1] = Math.cos(seed * 0.85) * 5.5;
      arr[i * 3 + 2] = Math.sin(seed * 0.45) * 4.5 - 2;
    }
    return { positions: arr };
  }, [isMobile]);

  return (
    <>
      <color attach="background" args={['#060B18']} />
      <fog attach="fog" args={['#060B18', 8, 18]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 6]} intensity={isMobile ? 2.2 : 2.8} color="#F8FAFC" />
      <pointLight position={[-4, 2.5, 3]} intensity={2.3} color="#7C3AED" />
      <pointLight position={[3, -2, 4]} intensity={2.1} color="#0EA5E9" />

      <Stars radius={55} depth={45} count={isMobile ? 750 : 1300} factor={2.8} saturation={0.8} fade speed={0.3} />
      <Sparkles count={isMobile ? 30 : 75} scale={8} size={1.7} speed={0.4} color="#A78BFA" opacity={0.62} />

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#A5B4FC" size={0.045} transparent opacity={0.5} sizeAttenuation />
      </points>

      <SceneRig>
        <Float speed={1.1} floatIntensity={0.4} rotationIntensity={0.15}>
          <PortfolioMockup />
        </Float>

        <OrbitalRings />

        {TECH_BADGES.map((badge, i) => (
          <TechBadge
            key={badge.label}
            {...badge}
            angleOffset={(Math.PI * 2 * i) / TECH_BADGES.length}
          />
        ))}

        {!isMobile && PROJECT_CARD_CONFIGS.map((card) => <ProjectCard key={card.tint} {...card} />)}
      </SceneRig>
    </>
  );
}

export function HeroScene() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, isMobile ? 1.2 : 1.7]}
      performance={{ min: 0.5 }}
      camera={{ position: [0, 0.15, 8.2], fov: isMobile ? 52 : 48 }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.15, 8.2]} fov={isMobile ? 52 : 48} />
      <SceneContents isMobile={isMobile} />
    </Canvas>
  );
}
