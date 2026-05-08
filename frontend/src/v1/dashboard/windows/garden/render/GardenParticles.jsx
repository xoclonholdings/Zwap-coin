import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

function Particle({
  position,
  color,
  speed,
  offset,
  size,
}) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const t = state.clock.elapsedTime * speed + offset;

    ref.current.position.y =
      position[1] + Math.sin(t) * 0.18;

    ref.current.position.x =
      position[0] + Math.cos(t * 0.7) * 0.08;

    ref.current.material.opacity =
      0.35 + (Math.sin(t * 2) + 1) * 0.25;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 10, 10]} />

      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

export default function GardenParticles({
  rarePlantUnlocked = false,
}) {
  const particles = useMemo(() => {
    return [...Array(18)].map((_, index) => ({
      id: index,
      position: [
        (Math.random() - 0.5) * 4,
        Math.random() * 3,
        (Math.random() - 0.5) * 2,
      ],
      speed: 0.5 + Math.random() * 1.2,
      offset: Math.random() * Math.PI * 2,
      size: 0.03 + Math.random() * 0.035,
    }));
  }, []);

  return (
    <group>
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          position={particle.position}
          speed={particle.speed}
          offset={particle.offset}
          size={particle.size}
          color={
            rarePlantUnlocked
              ? "#ff7ae7"
              : "#baff6c"
          }
        />
      ))}
    </group>
  );
}