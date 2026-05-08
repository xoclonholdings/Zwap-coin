import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

function getPlantConfig(stage = "seed", healthState = {}, rarePlantUnlocked = false) {
  const isRare = rarePlantUnlocked || stage === "rare";
  const healthKey = healthState?.key || "healthy";
  const isWeak = healthKey === "weak" || healthKey === "wilted";

  const stageMap = {
    seed: {
      stemHeight: 0.32,
      stemRadius: 0.045,
      leafScale: 0,
      leafPairs: 0,
      bloomScale: 0,
      podScale: 0.68,
    },
    sprout: {
      stemHeight: 0.82,
      stemRadius: 0.045,
      leafScale: 0.75,
      leafPairs: 1,
      bloomScale: 0,
      podScale: 0.76,
    },
    young: {
      stemHeight: 1.12,
      stemRadius: 0.05,
      leafScale: 0.95,
      leafPairs: 2,
      bloomScale: 0,
      podScale: 0.84,
    },
    mature: {
      stemHeight: 1.38,
      stemRadius: 0.055,
      leafScale: 1.08,
      leafPairs: 3,
      bloomScale: 0.76,
      podScale: 0.94,
    },
    rare: {
      stemHeight: 1.5,
      stemRadius: 0.058,
      leafScale: 1.18,
      leafPairs: 3,
      bloomScale: 0.92,
      podScale: 1,
    },
  };

  const base = stageMap[isRare ? "rare" : stage] || stageMap.seed;

  return {
    ...base,
    isRare,
    isWeak,
    isWilted: healthKey === "wilted",
    opacity: healthKey === "wilted" ? 0.55 : healthKey === "weak" ? 0.74 : 1,
    droop: healthKey === "wilted" ? 0.36 : healthKey === "weak" ? 0.18 : 0,
    glowColor: isRare ? "#d875ff" : healthState?.accent || "#7cff5b",
    leafColorA: isRare ? "#7cff5b" : "#7cff5b",
    leafColorB: isRare ? "#67f2ff" : "#baff6c",
    bloomColor: isRare ? "#ff7ae7" : "#d7ff8f",
    stemColor: isRare ? "#61ffd6" : "#7cff5b",
  };
}

function Stem({ config }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const sway = Math.sin(clock.elapsedTime * 1.15) * 0.025;
    ref.current.rotation.z = sway + config.droop;
  });

  return (
    <group ref={ref} position={[0, 0.12, 0]}>
      <mesh position={[0, config.stemHeight / 2, 0]}>
        <cylinderGeometry
          args={[config.stemRadius * 0.72, config.stemRadius, config.stemHeight, 24]}
        />
        <meshStandardMaterial
          color={config.stemColor}
          emissive={config.stemColor}
          emissiveIntensity={config.isRare ? 0.45 : 0.22}
          roughness={0.28}
          metalness={0.12}
          transparent
          opacity={config.opacity}
        />
      </mesh>
    </group>
  );
}

function Leaf({ side = 1, y = 0.55, scale = 1, config, delay = 0 }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const wave = Math.sin(clock.elapsedTime * 1.45 + delay) * 0.045;
    ref.current.rotation.z = side * (0.72 + wave + config.droop * 0.85);
    ref.current.rotation.y = side * 0.35;
  });

  return (
    <mesh
      ref={ref}
      position={[side * 0.22 * scale, y, 0]}
      scale={[0.34 * scale, 0.11 * scale, 0.055 * scale]}
    >
      <sphereGeometry args={[1, 32, 16]} />
      <meshStandardMaterial
        color={side > 0 ? config.leafColorA : config.leafColorB}
        emissive={side > 0 ? config.leafColorA : config.leafColorB}
        emissiveIntensity={config.isRare ? 0.35 : 0.16}
        roughness={0.22}
        metalness={0.08}
        transparent
        opacity={config.opacity}
      />
    </mesh>
  );
}

function Seed({ config }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.2) * 0.04);
  });

  return (
    <mesh ref={ref} position={[0, 0.22, 0]}>
      <sphereGeometry args={[0.16, 32, 24]} />
      <meshStandardMaterial
        color={config.leafColorA}
        emissive={config.leafColorA}
        emissiveIntensity={0.65}
        roughness={0.18}
        metalness={0.16}
        transparent
        opacity={config.opacity}
      />
    </mesh>
  );
}

function Bloom({ config }) {
  const groupRef = useRef(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.08;
    groupRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.7) * 0.035);
  });

  if (!config.bloomScale) return null;

  return (
    <group
      ref={groupRef}
      position={[0, config.stemHeight + 0.2, 0]}
      scale={config.bloomScale}
    >
      {[0, 1, 2, 3, 4, 5].map((petal) => {
        const angle = (Math.PI * 2 * petal) / 6;

        return (
          <mesh
            key={petal}
            position={[Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, 0]}
            rotation={[0, 0, angle]}
            scale={[0.17, 0.07, 0.045]}
          >
            <sphereGeometry args={[1, 24, 12]} />
            <meshStandardMaterial
              color={config.bloomColor}
              emissive={config.bloomColor}
              emissiveIntensity={config.isRare ? 0.7 : 0.38}
              roughness={0.24}
              metalness={0.08}
              transparent
              opacity={config.opacity}
            />
          </mesh>
        );
      })}

      <mesh position={[0, 0, 0.025]}>
        <sphereGeometry args={[0.085, 24, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          roughness={0.18}
          metalness={0.12}
        />
      </mesh>
    </group>
  );
}

function Plant({ config }) {
  const groupRef = useRef(null);
  const leafPairs = Array.from({ length: config.leafPairs });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.15) * 0.025;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.28) * 0.12;
  });

  return (
    <Float
      speed={1.15}
      rotationIntensity={0.08}
      floatIntensity={config.isWeak ? 0.12 : 0.24}
    >
      <group ref={groupRef} position={[0, -0.74, 0]}>
        {config.leafPairs === 0 ? <Seed config={config} /> : null}

        <Stem config={config} />

        {leafPairs.map((_, index) => {
          const y = 0.48 + index * 0.31;
          const scale = config.leafScale * (1 - index * 0.08);

          return (
            <group key={index}>
              <Leaf
                side={index % 2 === 0 ? -1 : 1}
                y={y}
                scale={scale}
                config={config}
                delay={index * 0.7}
              />
              <Leaf
                side={index % 2 === 0 ? 1 : -1}
                y={y + 0.08}
                scale={scale * 0.92}
                config={config}
                delay={index * 0.7 + 0.4}
              />
            </group>
          );
        })}

        <Bloom config={config} />

        <mesh position={[0, -0.01, 0]} scale={[0.64, 0.16, 0.44]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial
            color="#10150d"
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Pod({ config }) {
  return (
    <group position={[0, -0.7, 0]} scale={config.podScale}>
      <mesh position={[0, -0.04, 0]} scale={[0.86, 0.2, 0.86]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial
          color="#05090c"
          roughness={0.45}
          metalness={0.45}
        />
      </mesh>

      <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.86, 0.035, 16, 96]} />
        <meshStandardMaterial
          color={config.glowColor}
          emissive={config.glowColor}
          emissiveIntensity={0.55}
          roughness={0.24}
          metalness={0.22}
          transparent
          opacity={0.86}
        />
      </mesh>

      <mesh position={[0, 0.56, 0]} scale={[0.92, 0.68, 0.92]}>
        <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 1.92]} />
        <MeshTransmissionMaterial
          color="#dffff3"
          transmission={0.72}
          thickness={0.32}
          roughness={0.08}
          chromaticAberration={0.04}
          anisotropy={0.12}
          distortion={0.08}
          distortionScale={0.18}
          temporalDistortion={0.08}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

function GardenLights({ config }) {
  const pointRef = useRef(null);

  useFrame(({ clock }) => {
    if (!pointRef.current) return;

    pointRef.current.intensity =
      (config.isWeak ? 1.1 : 1.75) + Math.sin(clock.elapsedTime * 1.7) * 0.28;
  });

  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[3, 4, 4]} intensity={1.4} />
      <pointLight
        ref={pointRef}
        color={config.glowColor}
        position={[0, 0.2, 1.4]}
        intensity={1.7}
        distance={4}
      />
      <pointLight color="#67f2ff" position={[-1.4, 1.2, 1.8]} intensity={0.85} />
      <pointLight color="#baff6c" position={[1.3, -0.2, 1.2]} intensity={0.75} />
    </>
  );
}

function GardenScene({ stage, healthState, rarePlantUnlocked }) {
  const config = useMemo(
    () => getPlantConfig(stage, healthState, rarePlantUnlocked),
    [stage, healthState, rarePlantUnlocked]
  );

  return (
    <>
      <color attach="background" args={["#06100a"]} />
      <fog attach="fog" args={["#06100a", 3.3, 7.5]} />

      <GardenLights config={config} />

      <Sparkles
        count={config.isRare ? 52 : 28}
        scale={[2.8, 2.1, 1.5]}
        size={config.isRare ? 3.4 : 2.1}
        speed={config.isRare ? 0.55 : 0.32}
        color={config.glowColor}
        opacity={config.isWeak ? 0.26 : 0.55}
      />

      <group position={[0, 0, 0]}>
        <Pod config={config} />
        <Plant config={config} />
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </>
  );
}

function GardenFallback({ stage, healthState, rarePlantUnlocked }) {
  const isRare = rarePlantUnlocked || stage === "rare";
  const glow = isRare ? "rgba(255,122,231,0.45)" : healthState?.glow;

  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <div
        className="absolute bottom-16 h-44 w-44 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${glow}, transparent 72%)`,
        }}
      />
      <div className="relative mb-8 h-36 w-24 rounded-t-full border border-lime-300/25 bg-lime-300/10 shadow-[0_0_34px_rgba(124,255,91,0.2)]" />
    </div>
  );
}

export default function GardenHeroPlant({
  stage,
  healthState,
  rarePlantUnlocked,
}) {
  return (
    <div className="relative h-[260px] w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(124,255,91,0.18),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.035),transparent_42%)]" />

      <Suspense
        fallback={
          <GardenFallback
            stage={stage}
            healthState={healthState}
            rarePlantUnlocked={rarePlantUnlocked}
          />
        }
      >
        <Canvas
          camera={{ position: [0, 0.3, 4.15], fov: 36 }}
          dpr={[1, 1.75]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
        >
          <GardenScene
            stage={stage}
            healthState={healthState}
            rarePlantUnlocked={rarePlantUnlocked}
          />
        </Canvas>
      </Suspense>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/72 to-transparent" />
    </div>
  );
}