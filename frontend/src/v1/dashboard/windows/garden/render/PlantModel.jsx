import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

function PlantStem({ isRare, droop = 0 }) {
  const stemRef = useRef();

  useFrame((state) => {
    if (!stemRef.current) return;

    stemRef.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 1.2) * 0.04 + droop;
  });

  return (
    <mesh ref={stemRef} position={[0, -0.2, 0]}>
      <cylinderGeometry args={[0.08, 0.12, 2.3, 16]} />

      <meshStandardMaterial
        color={isRare ? "#7cffb2" : "#7cff5b"}
        emissive={isRare ? "#ff7ae7" : "#4ade80"}
        emissiveIntensity={isRare ? 1.6 : 0.8}
        roughness={0.45}
        metalness={0.1}
      />
    </mesh>
  );
}

function PlantLeaf({
  position,
  rotation,
  color,
  emissive,
  scale = 1,
}) {
  const leafRef = useRef();

  useFrame((state) => {
    if (!leafRef.current) return;

    leafRef.current.rotation.z =
      rotation[2] + Math.sin(state.clock.elapsedTime * 1.5) * 0.06;
  });

  return (
    <mesh
      ref={leafRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <sphereGeometry args={[0.34, 18, 18]} />

      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.55}
        roughness={0.7}
      />
    </mesh>
  );
}

function PlantFlower({ isRare }) {
  const flowerRef = useRef();

  useFrame((state) => {
    if (!flowerRef.current) return;

    flowerRef.current.rotation.y += 0.01;

    const pulse =
      1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.04;

    flowerRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <mesh ref={flowerRef} position={[0, 1.45, 0]}>
      <sphereGeometry args={[0.3, 24, 24]} />

      <meshStandardMaterial
        color={isRare ? "#ff7ae7" : "#d7ff8f"}
        emissive={isRare ? "#ff7ae7" : "#baff6c"}
        emissiveIntensity={isRare ? 2.2 : 1.25}
        roughness={0.35}
      />
    </mesh>
  );
}

function PlantPot() {
  return (
    <mesh position={[0, -1.8, 0]}>
      <cylinderGeometry args={[0.95, 1.15, 1.1, 24]} />

      <meshStandardMaterial
        color="#1b2430"
        roughness={0.88}
        metalness={0.18}
      />
    </mesh>
  );
}

export default function PlantModel({
  stage,
  healthState,
  rarePlantUnlocked,
}) {
  const isRare =
    rarePlantUnlocked || stage === "rare";

  const isWeak =
    healthState?.key === "weak" ||
    healthState?.key === "wilted";

  const droop = useMemo(() => {
    if (healthState?.key === "wilted") return 0.28;
    if (healthState?.key === "weak") return 0.12;
    return 0;
  }, [healthState]);

  const showLeaves = stage !== "seed";

  const showSecondLeaves = [
    "young",
    "mature",
    "rare",
  ].includes(stage);

  const showFlower = [
    "mature",
    "rare",
  ].includes(stage);

  return (
    <group
      position={[0, -0.35, 0]}
      scale={isWeak ? 0.92 : 1}
    >
      <PlantStem
        isRare={isRare}
        droop={droop}
      />

      {showLeaves ? (
        <>
          <PlantLeaf
            position={[-0.52, 0.15, 0]}
            rotation={[0, 0, -0.7]}
            color={isRare ? "#b486ff" : "#7cff5b"}
            emissive={isRare ? "#ff7ae7" : "#4ade80"}
            scale={1.1}
          />

          <PlantLeaf
            position={[0.52, 0.35, 0]}
            rotation={[0, 0, 0.7]}
            color={isRare ? "#67f2ff" : "#baff6c"}
            emissive={isRare ? "#67f2ff" : "#84cc16"}
            scale={1.1}
          />
        </>
      ) : null}

      {showSecondLeaves ? (
        <>
          <PlantLeaf
            position={[-0.34, 0.82, 0]}
            rotation={[0, 0, -0.4]}
            color={isRare ? "#ff7ae7" : "#d9ff9f"}
            emissive={isRare ? "#ff7ae7" : "#84cc16"}
            scale={0.72}
          />

          <PlantLeaf
            position={[0.34, 0.95, 0]}
            rotation={[0, 0, 0.4]}
            color={isRare ? "#67f2ff" : "#c7ff8d"}
            emissive={isRare ? "#67f2ff" : "#65a30d"}
            scale={0.72}
          />
        </>
      ) : null}

      {showFlower ? (
        <PlantFlower isRare={isRare} />
      ) : null}

      <PlantPot />
    </group>
  );
}