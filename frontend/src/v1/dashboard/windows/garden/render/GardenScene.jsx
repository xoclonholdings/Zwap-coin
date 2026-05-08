import React from "react";
import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";

import PlantModel from "./PlantModel";

export default function GardenScene({
  stage = "seed",
  healthState,
  rarePlantUnlocked = false,
}) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{
          position: [0, 0.8, 5],
          fov: 42,
        }}
        gl={{
          antialias: true,
          alpha: true,
        }}
        dpr={[1, 2]}
      >
        {/* Ambient base light */}
        <ambientLight intensity={1.15} color="#d9ffe7" />

        {/* Main glow light */}
        <pointLight
          position={[0, 2.5, 3]}
          intensity={18}
          color={
            rarePlantUnlocked
              ? "#ff7ae7"
              : healthState?.accent || "#7cff5b"
          }
        />

        {/* Rim light */}
        <pointLight
          position={[-3, 1, -2]}
          intensity={8}
          color="#67f2ff"
        />

        {/* Bottom fill */}
        <pointLight
          position={[0, -3, 2]}
          intensity={4}
          color="#7cff5b"
        />

        <Float
          speed={1.8}
          rotationIntensity={0.08}
          floatIntensity={0.18}
        >
          <PlantModel
            stage={stage}
            healthState={healthState}
            rarePlantUnlocked={rarePlantUnlocked}
          />
        </Float>
      </Canvas>
    </div>
  );
}