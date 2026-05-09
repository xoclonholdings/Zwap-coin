import React from "react";

function Stem({
  isRare,
  isWilted,
}) {
  return (
    <mesh
      position={[0, -0.1, 0]}
      rotation={[0, 0, isWilted ? 0.22 : 0.04]}
    >
      <cylinderGeometry args={[0.08, 0.12, 2.2, 16]} />

      <meshStandardMaterial
        color={isRare ? "#8dffb1" : "#63ff72"}
        emissive={isRare ? "#ff7ae7" : "#52ff7a"}
        emissiveIntensity={isRare ? 1.8 : 0.8}
        roughness={0.35}
        metalness={0.08}
      />
    </mesh>
  );
}

function Leaf({
  position,
  rotation,
  color,
  emissive,
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <sphereGeometry args={[0.32, 18, 18]} />

      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.55}
        roughness={0.4}
        metalness={0.05}
      />
    </mesh>
  );
}

function Bloom({
  isRare,
}) {
  return (
    <mesh position={[0, 1.3, 0]}>
      <sphereGeometry args={[0.36, 24, 24]} />

      <meshStandardMaterial
        color={isRare ? "#ffd3fb" : "#f3ffd1"}
        emissive={isRare ? "#ff7ae7" : "#b7ff75"}
        emissiveIntensity={2.4}
        roughness={0.22}
        metalness={0.12}
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

  const isWilted =
    healthState?.key === "wilted";

  const showLeaves =
    stage !== "seed";

  const showUpperLeaves =
    ["young", "mature", "rare"].includes(stage);

  const showBloom =
    ["mature", "rare"].includes(stage);

  return (
    <group position={[0, -0.8, 0]}>
      <Stem
        isRare={isRare}
        isWilted={isWilted}
      />

      {showLeaves ? (
        <>
          <Leaf
            position={[-0.55, 0.1, 0]}
            rotation={[0, 0, 0.8]}
            color={isRare ? "#b486ff" : "#a6ff6f"}
            emissive={isRare ? "#ff7ae7" : "#63ff72"}
          />

          <Leaf
            position={[0.55, 0.25, 0]}
            rotation={[0, 0, -0.8]}
            color={isRare ? "#67f2ff" : "#d7ff8f"}
            emissive={isRare ? "#b486ff" : "#7cff5b"}
          />
        </>
      ) : null}

      {showUpperLeaves ? (
        <>
          <Leaf
            position={[-0.38, 0.8, 0]}
            rotation={[0, 0, 0.45]}
            color={isRare ? "#ff7ae7" : "#b9ff73"}
            emissive={isRare ? "#67f2ff" : "#7cff5b"}
          />

          <Leaf
            position={[0.38, 0.95, 0]}
            rotation={[0, 0, -0.45]}
            color={isRare ? "#67f2ff" : "#d9ff96"}
            emissive={isRare ? "#ff7ae7" : "#7cff5b"}
          />
        </>
      ) : null}

      {showBloom ? (
        <Bloom isRare={isRare} />
      ) : null}
    </group>
  );
}