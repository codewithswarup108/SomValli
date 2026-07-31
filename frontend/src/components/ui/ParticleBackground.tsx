import React from 'react';

const particles = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61) % 100}%`,
  delay: `${(index % 7) * 0.45}s`,
  duration: `${5 + (index % 5)}s`,
  size: `${2 + (index % 3)}px`,
}));

const ParticleBackground: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {particles.map((particle, index) => (
      <span
        key={index}
        className="absolute rounded-full bg-accent/50 animate-[splash-float_var(--duration)_ease-in-out_var(--delay)_infinite]"
        style={{
          left: particle.left,
          top: particle.top,
          width: particle.size,
          height: particle.size,
          '--delay': particle.delay,
          '--duration': particle.duration,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

export default ParticleBackground;
