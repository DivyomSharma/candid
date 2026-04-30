"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { AsciiRenderer } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function RotatingTorus() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.15;
      ref.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      {/* A soft, calm torus knot or simple torus */}
      <torusGeometry args={[2.5, 0.8, 32, 64]} />
      <meshStandardMaterial color="white" roughness={0.8} />
    </mesh>
  );
}

export default function AsciiBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen" style={{ color: "hsl(var(--glow))" }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />
        
        <RotatingTorus />
        
        <AsciiRenderer 
          fgColor="currentColor" 
          bgColor="transparent" 
          characters=" .:-+*=%@" 
          resolution={0.18}
          invert={false}
        />
      </Canvas>
    </div>
  );
}
