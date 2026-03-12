'use client';

import { useState, useEffect } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { IOptions, RecursivePartial } from '@tsparticles/engine';

const particleConfig: RecursivePartial<IOptions> = {
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'repulse' },
      onClick: { enable: true, mode: 'push' },
    },
    modes: {
      repulse: { distance: 100, duration: 0.4 },
      push: { quantity: 2 },
    },
  },
  particles: {
    color: { value: ['#7C3AED', '#0EA5E9', '#F59E0B'] },
    links: {
      color: '#7C3AED',
      distance: 140,
      enable: true,
      opacity: 0.15,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: { default: 'bounce' },
      random: true,
      speed: 0.6,
      straight: false,
    },
    number: { density: { enable: true }, value: 80 },
    opacity: { value: { min: 0.1, max: 0.5 } },
    shape: { type: 'circle' },
    size: { value: { min: 1, max: 3 } },
  },
  detectRetina: true,
};

export function ParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={particleConfig}
      className="fixed inset-0 -z-10 h-full w-full"
    />
  );
}
