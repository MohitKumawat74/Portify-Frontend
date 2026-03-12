'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, PerspectiveCamera, Float, Billboard, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const SKILLS = [
  'React', 'Next.js', 'TypeScript', 'Node.js',
  'MongoDB', 'Tailwind', 'GraphQL', 'Docker',
  'Python', 'AWS', 'Git', 'Figma',
];

const SKILL_COLORS: Record<string, string> = {
  'React':      '#61DAFB',
  'Next.js':    '#FFFFFF',
  'TypeScript': '#3178C6',
  'Node.js':    '#68a063',
  'MongoDB':    '#4DB33D',
  'Tailwind':   '#38BDF8',
  'GraphQL':    '#E10098',
  'Docker':     '#2496ED',
  'Python':     '#F7CC42',
  'AWS':        '#FF9900',
  'Git':        '#F05032',
  'Figma':      '#FF7262',
};

// SkillLabel: uses Billboard for correct camera-facing, no broken ref on Float
function SkillLabel({
  name,
  position,
  color,
}: { name: string; position: [number, number, number]; color: string }) {
  return (
    <Float speed={1.5} floatIntensity={0.4} position={position}>
      <Billboard>
        {/* Colored dot above label */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
        </mesh>
        {/* No font prop — Drei uses its own built-in font which always loads */}
        <Text
          fontSize={0.24}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {name}
        </Text>
      </Billboard>
    </Float>
  );
}

function SkillsOrb() {
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef  = useRef<THREE.Mesh>(null!);

  const positions = useMemo<[number, number, number][]>(() =>
    SKILLS.map((_, i) => {
      const phi   = Math.acos(-1 + (2 * i) / SKILLS.length);
      const theta = Math.sqrt(SKILLS.length * Math.PI) * phi;
      const r = 2.8;
      return [
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi),
      ];
    }),
  []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.2;
    coreRef.current.rotation.y  = t * 0.5;
    coreRef.current.rotation.z  = t * 0.3;
  });

  return (
    <group ref={groupRef}>
      {/* Central wireframe icosahedron */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial
          color="#7C3AED"
          metalness={0.9}
          roughness={0.1}
          emissive="#3b0080"
          emissiveIntensity={0.6}
          wireframe
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshStandardMaterial
          color="#7C3AED"
          transparent
          opacity={0.12}
          emissive="#5b2cd4"
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* Skill labels — Billboard handles camera-facing correctly */}
      {SKILLS.map((skill, i) => (
        <SkillLabel
          key={skill}
          name={skill}
          position={positions[i]}
          color={SKILL_COLORS[skill] ?? '#FFFFFF'}
        />
      ))}

      {/* Orbit rings */}
      {([
        [1.5, [Math.PI / 2, 0, 0],           '#7C3AED', 0.35],
        [2.2, [Math.PI / 2 + 0.6, 0, 0.3],   '#0EA5E9', 0.25],
        [3.1, [Math.PI / 3, 0, Math.PI / 4],  '#EC4899', 0.2],
      ] as [number, [number, number, number], string, number][]).map(([r, rot, col, op], i) => (
        <mesh key={i} rotation={rot}>
          <torusGeometry args={[r, 0.012, 8, 100]} />
          <meshStandardMaterial
            color={col}
            metalness={1}
            emissive={col}
            emissiveIntensity={0.6}
            transparent
            opacity={op}
          />
        </mesh>
      ))}
    </group>
  );
}

export function SkillsScene() {
  return (
    <Canvas
      className="h-full w-full"
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={50} />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]}   intensity={2.5} color="#7C3AED" />
      <pointLight position={[-5, -5, 5]} intensity={2}   color="#0EA5E9" />
      <pointLight position={[0, 5, -3]}  intensity={1.2} color="#EC4899" />
      <Sparkles count={50} scale={7} size={1.2} speed={0.4} color="#7C3AED" />
      <SkillsOrb />
    </Canvas>
  );
}
