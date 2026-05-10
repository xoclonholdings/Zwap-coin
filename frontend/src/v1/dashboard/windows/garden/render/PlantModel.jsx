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
    stemRef.current.rotation.z = getPlantSwayRotation(time, 0.75) + droop;
  });

  return (
    <group ref={stemRef} position={[0, -0.05, 0]}>
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.055, 0.095, 1.95, 32]} />
        <meshStandardMaterial
          color={isRare ? "#79ffd9" : "#7cff5b"}
          emissive={isRare ? "#ff7ae7" : "#52ff7a"}
          emissiveIntensity={isRare ? 1.15 : 0.72}
          roughness={0.28}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[0.025, 0.48, 0.045]}>
        <cylinderGeometry args={[0.012, 0.018, 1.82, 16]} />
        <meshStandardMaterial
          color={isRare ? "#f8d7ff" : "#d9ff9f"}
          emissive={isRare ? "#ff7ae7" : "#baff6c"}
          emissiveIntensity={0.62}
          roughness={0.2}
          metalness={0.04}
        />
      </mesh>
    </group>
  );
}

function Leaf({
  position,
  rotation,
  color,
  emissive,
  scale = 1,
  healthKey,
  side = 1,
}) {
  const leafRef = useRef(null);
  const veinRef = useRef(null);

  useFrame((state) => {
    if (!leafRef.current) return;

    const time = state.clock.elapsedTime;
    const weakAmount =
      healthKey === "wilted" ? 0.28 : healthKey === "weak" ? 0.55 : 0.9;

    leafRef.current.rotation.z = getLeafSwayRotation(
      time,
      rotation[2],
      weakAmount
    );

    if (veinRef.current) {
      veinRef.current.rotation.z = leafRef.current.rotation.z;
    }
  });

  return (
    <group>
      <mesh
        ref={leafRef}
        position={position}
        rotation={rotation}
        scale={[scale * 1.28, scale * 0.34, scale * 0.12]}
      >
        <sphereGeometry args={[0.34, 40, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.5}
          roughness={0.32}
          metalness={0.06}
        />
      </mesh>

      <mesh
        ref={veinRef}
        position={[
          position[0] + side * 0.012,
          position[1],
          position[2] + 0.045,
        ]}
        rotation={rotation}
        scale={[scale * 0.96, scale * 0.05, scale * 0.035]}
      >
        <sphereGeometry args={[0.26, 24, 12]} />
        <meshStandardMaterial
          color="#eaffc4"
          emissive={isFinite(scale) ? emissive : "#7cff5b"}
          emissiveIntensity={0.34}
          roughness={0.24}
          metalness={0.04}
        />
      </mesh>
    </group>
  );
}

function Bloom({ isRare }) {
  const bloomRef = useRef(null);

  useFrame((state) => {
    if (!bloomRef.current) return;

    const time = state.clock.elapsedTime;
    const pulse = getFlowerPulse(time, isRare ? 1.15 : 0.85);

    bloomRef.current.rotation.y += 0.008;
    bloomRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <group ref={bloomRef} position={[0, 1.62, 0]}>
      {[0, 1, 2, 3, 4, 5].map((petal) => {
        const angle = (Math.PI * 2 * petal) / 6;

        return (
          <mesh
            key={petal}
            position={[Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, 0]}
            rotation={[0, 0, angle]}
            scale={[0.32, 0.12, 0.08]}
          >
            <sphereGeometry args={[0.58, 28, 16]} />
            <meshStandardMaterial
              color={isRare ? "#ff9df0" : "#d7ff8f"}
              emissive={isRare ? "#ff7ae7" : "#b7ff75"}
              emissiveIntensity={isRare ? 1.65 : 1.05}
              roughness={0.24}
              metalness={0.08}
            />
          </mesh>
        );
      })}

      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.13, 28, 18]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
          roughness={0.18}
          metalness={0.1}
        />
      </mesh>
    </group>
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
    <mesh ref={seedRef} position={[0, -0.25, 0]}>
      <sphereGeometry args={[0.24, 32, 22]} />
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

function GlassDome({ isRare }) {
  return (
    <group position={[0, -1.12, 0]}>
      <mesh position={[0, 0.55, 0]} scale={[1.12, 0.82, 1.12]}>
        <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
        <meshPhysicalMaterial
          color="#dffff5"
          transparent
          opacity={0.18}
          roughness={0.04}
          metalness={0.04}
          transmission={0.45}
          thickness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>

      <mesh position={[0, 0.49, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.02, 0.018, 16, 96]} />
        <meshStandardMaterial
          color={isRare ? "#ff7ae7" : "#8cff66"}
          emissive={isRare ? "#ff7ae7" : "#7cff5b"}
          emissiveIntensity={1.15}
          roughness={0.18}
          metalness={0.18}
        />
      </mesh>
    </group>
  );
}

function Pot({ isRare }) {
  return (
    <group position={[0, -1.48, 0]}>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.9, 1.08, 0.72, 40]} />
        <meshStandardMaterial
          color="#07090d"
          roughness={0.72}
          metalness={0.34}
        />
      </mesh>

      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.92, 0.045, 18, 96]} />
        <meshStandardMaterial
          color={isRare ? "#ff7ae7" : "#7cff5b"}
          emissive={isRare ? "#ff7ae7" : "#7cff5b"}
          emissiveIntensity={1.15}
          roughness={0.22}
          metalness={0.18}
        />
      </mesh>

      <mesh position={[0, 0.36, 0]} scale={[0.82, 0.16, 0.82]}>
        <sphereGeometry args={[1, 36, 18]} />
        <meshStandardMaterial color="#070f08" roughness={0.92} />
      </mesh>

      <mesh position={[0, -0.15, 0.91]}>
        <sphereGeometry args={[0.13, 24, 14]} />
        <meshStandardMaterial
          color="#111827"
          emissive={isRare ? "#ff7ae7" : "#7cff5b"}
          emissiveIntensity={0.42}
          roughness={0.35}
          metalness={0.45}
        />
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
    groupRef.current.position.y =
      -0.28 + getPlantFloatY(time, isWeak ? 0.35 : 0.7);
    groupRef.current.rotation.y = Math.sin(time * 0.24) * 0.1;
  });

  return (
    <group ref={groupRef} scale={plantScale}>
      <GlassDome isRare={isRare} />
      <Pot isRare={isRare} />

      <group position={[0, -0.14, 0]}>
        {showLeaves ? (
          <>
            <Stem isRare={isRare} healthKey={healthKey} />

            <Leaf
              position={[-0.58, 0.05, 0]}
              rotation={[0.05, 0, 0.72]}
              color={isRare ? "#b486ff" : "#7cff5b"}
              emissive={isRare ? "#ff7ae7" : "#63ff72"}
              scale={1.06}
              healthKey={healthKey}
              side={-1}
            />

            <Leaf
              position={[0.58, 0.22, 0]}
              rotation={[0.05, 0, -0.72]}
              color={isRare ? "#67f2ff" : "#d7ff8f"}
              emissive={isRare ? "#b486ff" : "#7cff5b"}
              scale={1.06}
              healthKey={healthKey}
              side={1}
            />
          </>
        ) : (
          <Seed isRare={isRare} />
        )}

        {showUpperLeaves ? (
          <>
            <Leaf
              position={[-0.42, 0.76, 0]}
              rotation={[0.05, 0, 0.42]}
              color={isRare ? "#ff7ae7" : "#b9ff73"}
              emissive={isRare ? "#67f2ff" : "#7cff5b"}
              scale={0.78}
              healthKey={healthKey}
              side={-1}
            />

            <Leaf
              position={[0.42, 0.94, 0]}
              rotation={[0.05, 0, -0.42]}
              color={isRare ? "#67f2ff" : "#d9ff96"}
              emissive={isRare ? "#ff7ae7" : "#7cff5b"}
              scale={0.78}
              healthKey={healthKey}
              side={1}
            />
          </>
        ) : null}

        {showBloom ? <Bloom isRare={isRare} /> : null}
      </group>
    </group>
  );
}