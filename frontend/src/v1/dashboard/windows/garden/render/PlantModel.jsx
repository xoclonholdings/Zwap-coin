import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  getFlowerPulse,
  getLeafSwayRotation,
  getPlantDroop,
  getPlantFloatY,
  getPlantSwayRotation,
  getWeakPlantScale,
} from "./PlantAnimations";

function GlassDome({ isRare }) {
  return (
    <group position={[0, -1.05, 0]}>
      {/* Base */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[1.28, 1.42, 0.5, 48]} />

        <meshStandardMaterial
          color="#0b1016"
          roughness={0.52}
          metalness={0.42}
        />
      </mesh>

      {/* Neon ring */}
      <mesh position={[0, -0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.22, 0.03, 18, 120]} />

        <meshStandardMaterial
          color={isRare ? "#ff7ae7" : "#9eff64"}
          emissive={isRare ? "#ff7ae7" : "#9eff64"}
          emissiveIntensity={2.4}
          roughness={0.2}
          metalness={0.65}
        />
      </mesh>

      {/* Glass */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[1.32, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />

        <meshPhysicalMaterial
          color="#d7f7ff"
          transparent
          opacity={0.08}
          roughness={0}
          transmission={1}
          thickness={0.9}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* Soil */}
      <mesh position={[0, -0.56, 0]} scale={[1.05, 0.32, 1.05]}>
        <sphereGeometry args={[1, 42, 24]} />

        <meshStandardMaterial
          color="#2a1b10"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Moss glow */}
      <mesh position={[0, -0.48, 0]} scale={[0.9, 0.22, 0.9]}>
        <sphereGeometry args={[1, 32, 18]} />

        <meshStandardMaterial
          color="#7ea93d"
          emissive="#95ff54"
          emissiveIntensity={0.22}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

function Stem({ healthKey }) {
  const stemRef = useRef(null);
  const droop = getPlantDroop(healthKey);

  useFrame((state) => {
    if (!stemRef.current) return;

    const time = state.clock.elapsedTime;

    stemRef.current.rotation.z =
      getPlantSwayRotation(time, 0.55) + droop;

    stemRef.current.rotation.x =
      Math.sin(time * 0.5) * 0.02;
  });

  return (
    <mesh ref={stemRef} position={[0, -0.08, 0]}>
      <cylinderGeometry args={[0.03, 0.055, 2.45, 24]} />

      <meshStandardMaterial
        color="#5f8f2c"
        emissive="#7dff52"
        emissiveIntensity={0.14}
        roughness={0.92}
      />
    </mesh>
  );
}

function Leaf({
  position,
  rotation,
  scale = 1,
  healthKey,
}) {
  const leafRef = useRef(null);

  const weakAmount =
    healthKey === "wilted"
      ? 0.4
      : healthKey === "weak"
      ? 0.7
      : 1;

  useFrame((state) => {
    if (!leafRef.current) return;

    const time = state.clock.elapsedTime;

    leafRef.current.rotation.z = getLeafSwayRotation(
      time,
      rotation[2],
      weakAmount * 0.45
    );
  });

  return (
    <group
      ref={leafRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      {/* Main leaf */}
      <mesh scale={[1, 1.7, 0.08]}>
        <sphereGeometry args={[0.2, 32, 32]} />

        <meshStandardMaterial
          color="#5f8c31"
          emissive="#8fff61"
          emissiveIntensity={0.08}
          roughness={0.88}
        />
      </mesh>

      {/* Vein */}
      <mesh position={[0, 0, 0.01]} scale={[0.06, 1.3, 0.02]}>
        <boxGeometry args={[1, 1, 1]} />

        <meshStandardMaterial
          color="#c7f08b"
          emissive="#d8ffae"
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  );
}

function Flower() {
  const flowerRef = useRef(null);

  const petals = useMemo(() => {
    return new Array(6).fill(0).map((_, index) => {
      const angle = (Math.PI * 2 * index) / 6;

      return {
        x: Math.cos(angle) * 0.18,
        y: Math.sin(angle) * 0.18,
        rotation: angle,
      };
    });
  }, []);

  useFrame((state) => {
    if (!flowerRef.current) return;

    const time = state.clock.elapsedTime;
    const pulse = getFlowerPulse(time, 0.8);

    flowerRef.current.scale.set(pulse, pulse, pulse);
    flowerRef.current.rotation.z =
      Math.sin(time * 0.55) * 0.03;
  });

  return (
    <group ref={flowerRef} position={[0, 1.32, 0]}>
      {petals.map((petal, index) => (
        <mesh
          key={index}
          position={[petal.x, petal.y, 0]}
          rotation={[0, 0, petal.rotation]}
          scale={[0.34, 0.68, 0.08]}
        >
          <sphereGeometry args={[0.16, 32, 32]} />

          <meshStandardMaterial
            color="#fffef2"
            emissive="#fff8d8"
            emissiveIntensity={0.16}
            roughness={0.72}
          />
        </mesh>
      ))}

      {/* Center */}
      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry args={[0.12, 28, 28]} />

        <meshStandardMaterial
          color="#b9d447"
          emissive="#e4ff6a"
          emissiveIntensity={0.45}
          roughness={0.55}
        />
      </mesh>
    </group>
  );
}

function Seed() {
  const seedRef = useRef(null);

  useFrame((state) => {
    if (!seedRef.current) return;

    const time = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(time * 2) * 0.04;

    seedRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <mesh ref={seedRef} position={[0, -0.38, 0]}>
      <sphereGeometry args={[0.18, 28, 28]} />

      <meshStandardMaterial
        color="#8eb84c"
        emissive="#a7ff5d"
        emissiveIntensity={0.22}
        roughness={0.72}
      />
    </mesh>
  );
}

export default function PlantModel({
  stage,
  healthState,
  rarePlantUnlocked,
}) {
  const groupRef = useRef(null);

  const healthKey = healthState?.key || "healthy";

  const isWeak =
    healthKey === "weak" ||
    healthKey === "wilted";

  const scale = useMemo(
    () => getWeakPlantScale(isWeak),
    [isWeak]
  );

  const showLeaves =
    stage !== "seed";

  const showUpperLeaves =
    ["young", "mature", "rare"].includes(stage);

  const showFlower =
    ["mature", "rare"].includes(stage);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    groupRef.current.position.y =
      -0.15 + getPlantFloatY(time, isWeak ? 0.45 : 1);

    groupRef.current.rotation.y =
      Math.sin(time * 0.25) * 0.08;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <GlassDome isRare={rarePlantUnlocked} />

      <group position={[0, -0.18, 0]}>
        {showLeaves ? (
          <>
            <Stem healthKey={healthKey} />

            {/* Lower leaves */}
            <Leaf
              position={[-0.55, -0.08, 0]}
              rotation={[0, 0, 1.08]}
              scale={1.18}
              healthKey={healthKey}
            />

            <Leaf
              position={[0.58, 0.16, 0]}
              rotation={[0, 0, -1.05]}
              scale={1.08}
              healthKey={healthKey}
            />

            {/* Mid leaves */}
            <Leaf
              position={[-0.38, 0.52, 0]}
              rotation={[0, 0, 0.88]}
              scale={0.88}
              healthKey={healthKey}
            />

            <Leaf
              position={[0.42, 0.7, 0]}
              rotation={[0, 0, -0.82]}
              scale={0.96}
              healthKey={healthKey}
            />
          </>
        ) : (
          <Seed />
        )}

        {showUpperLeaves ? (
          <>
            <Leaf
              position={[-0.18, 0.98, 0]}
              rotation={[0, 0, 0.5]}
              scale={0.62}
              healthKey={healthKey}
            />

            <Leaf
              position={[0.22, 1.12, 0]}
              rotation={[0, 0, -0.48]}
              scale={0.58}
              healthKey={healthKey}
            />
          </>
        ) : null}

        {showFlower ? <Flower /> : null}
      </group>
    </group>
  );
}