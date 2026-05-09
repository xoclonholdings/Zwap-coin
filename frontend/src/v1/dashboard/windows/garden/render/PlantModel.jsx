import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import {
  getFlowerPulse,
  getLeafSwayRotation,
  getPlantDroop,
  getPlantFloatY,
  getPlantSwayRotation,
  getWeakPlantScale,
} from "./PlantAnimations";

function Stem({ isRare, healthKey }) {
  const stemRef = useRef(null);
  const droop = getPlantDroop(healthKey);

  useFrame((state) => {
    if (!stemRef.current) return;

    const time = state.clock.elapsedTime;
    stemRef.current.rotation.z = getPlantSwayRotation(time, 1) + droop;
  });

  return (
    <mesh ref={stemRef} position={[0, -0.1, 0]}>
      <cylinderGeometry args={[0.08, 0.12, 2.2, 24]} />
      <meshStandardMaterial
        color={isRare ? "#8dffb1" : "#63ff72"}
        emissive={isRare ? "#ff7ae7" : "#52ff7a"}
        emissiveIntensity={isRare ? 1.8 : 0.85}
        roughness={0.35}
        metalness={0.08}
      />
    </mesh>
  );
}

function Leaf({ position, rotation, color, emissive, scale = 1, healthKey }) {
  const leafRef = useRef(null);

  useFrame((state) => {
    if (!leafRef.current) return;

    const time = state.clock.elapsedTime;
    const weakAmount = healthKey === "wilted" ? 0.35 : healthKey === "weak" ? 0.6 : 1;

    leafRef.current.rotation.z = getLeafSwayRotation(time, rotation[2], weakAmount);
  });

  return (
    <mesh ref={leafRef} position={position} rotation={rotation} scale={[scale, scale * 0.55, scale * 0.16]}>
      <sphereGeometry args={[0.36, 24, 18]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.58}
        roughness={0.4}
        metalness={0.05}
      />
    </mesh>
  );
}

function Bloom({ isRare }) {
  const bloomRef = useRef(null);

  useFrame((state) => {
    if (!bloomRef.current) return;

    const time = state.clock.elapsedTime;
    const pulse = getFlowerPulse(time, isRare ? 1.3 : 1);

    bloomRef.current.rotation.y += 0.01;
    bloomRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <mesh ref={bloomRef} position={[0, 1.3, 0]}>
      <sphereGeometry args={[0.36, 32, 24]} />
      <meshStandardMaterial
        color={isRare ? "#ffd3fb" : "#f3ffd1"}
        emissive={isRare ? "#ff7ae7" : "#b7ff75"}
        emissiveIntensity={isRare ? 2.4 : 1.55}
        roughness={0.22}
        metalness={0.12}
      />
    </mesh>
  );
}

function Seed({ isRare }) {
  const seedRef = useRef(null);

  useFrame((state) => {
    if (!seedRef.current) return;

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.05;
    seedRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <mesh ref={seedRef} position={[0, -0.45, 0]}>
      <sphereGeometry args={[0.24, 28, 20]} />
      <meshStandardMaterial
        color={isRare ? "#ff7ae7" : "#baff6c"}
        emissive={isRare ? "#ff7ae7" : "#7cff5b"}
        emissiveIntensity={1.3}
        roughness={0.22}
        metalness={0.12}
      />
    </mesh>
  );
}

function Pot({ isRare }) {
  return (
    <group position={[0, -1.45, 0]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.88, 1.08, 0.78, 32]} />
        <meshStandardMaterial
          color="#111827"
          roughness={0.78}
          metalness={0.18}
        />
      </mesh>

      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.88, 0.035, 16, 72]} />
        <meshStandardMaterial
          color={isRare ? "#ff7ae7" : "#7cff5b"}
          emissive={isRare ? "#ff7ae7" : "#7cff5b"}
          emissiveIntensity={0.95}
          roughness={0.28}
          metalness={0.18}
        />
      </mesh>

      <mesh position={[0, 0.45, 0]} scale={[0.82, 0.16, 0.82]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color="#07100a" roughness={0.92} />
      </mesh>
    </group>
  );
}

export default function PlantModel({ stage, healthState, rarePlantUnlocked }) {
  const healthKey = healthState?.key || "healthy";
  const isRare = rarePlantUnlocked || stage === "rare";
  const isWeak = healthKey === "weak" || healthKey === "wilted";

  const showLeaves = stage !== "seed";
  const showUpperLeaves = ["young", "mature", "rare"].includes(stage);
  const showBloom = ["mature", "rare"].includes(stage);

  const plantScale = useMemo(() => getWeakPlantScale(isWeak), [isWeak]);
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    groupRef.current.position.y = -0.35 + getPlantFloatY(time, isWeak ? 0.45 : 1);
    groupRef.current.rotation.y = Math.sin(time * 0.28) * 0.12;
  });

  return (
    <group ref={groupRef} scale={plantScale}>
      <Pot isRare={isRare} />

      <group position={[0, -0.2, 0]}>
        {showLeaves ? (
          <>
            <Stem isRare={isRare} healthKey={healthKey} />

            <Leaf
              position={[-0.55, 0.1, 0]}
              rotation={[0, 0, 0.8]}
              color={isRare ? "#b486ff" : "#a6ff6f"}
              emissive={isRare ? "#ff7ae7" : "#63ff72"}
              scale={1}
              healthKey={healthKey}
            />

            <Leaf
              position={[0.55, 0.25, 0]}
              rotation={[0, 0, -0.8]}
              color={isRare ? "#67f2ff" : "#d7ff8f"}
              emissive={isRare ? "#b486ff" : "#7cff5b"}
              scale={1}
              healthKey={healthKey}
            />
          </>
        ) : (
          <Seed isRare={isRare} />
        )}

        {showUpperLeaves ? (
          <>
            <Leaf
              position={[-0.38, 0.8, 0]}
              rotation={[0, 0, 0.45]}
              color={isRare ? "#ff7ae7" : "#b9ff73"}
              emissive={isRare ? "#67f2ff" : "#7cff5b"}
              scale={0.72}
              healthKey={healthKey}
            />

            <Leaf
              position={[0.38, 0.95, 0]}
              rotation={[0, 0, -0.45]}
              color={isRare ? "#67f2ff" : "#d9ff96"}
              emissive={isRare ? "#ff7ae7" : "#7cff5b"}
              scale={0.72}
              healthKey={healthKey}
            />
          </>
        ) : null}

        {showBloom ? <Bloom isRare={isRare} /> : null}
      </group>
    </group>
  );
}