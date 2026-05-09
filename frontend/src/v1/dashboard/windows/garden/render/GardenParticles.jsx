import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 70;

export default function GardenParticles({
  rarePlantUnlocked = false,
  healthState,
}) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const array = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3;

      array[i3] = (Math.random() - 0.5) * 5;
      array[i3 + 1] = Math.random() * 5 - 1;
      array[i3 + 2] = (Math.random() - 0.5) * 4;
    }

    return array;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y =
      state.clock.elapsedTime * 0.04;

    pointsRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.045}
        transparent
        depthWrite={false}
        opacity={0.9}
        color={
          rarePlantUnlocked
            ? "#ff7ae7"
            : healthState?.accent || "#7cff5b"
        }
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}