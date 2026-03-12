import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { WordScore } from "../types";
import "./WordCloudScene.css";

interface WordCloudSceneProps {
  words: WordScore[];
}

/** Fibonacci sphere: distributes N points evenly on a sphere surface. */
function fibonacciSphere(count: number, radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]);
  }

  return points;
}

function weightToSize(weight: number): number {
  return 0.2 + weight * 1.2;
}

function weightToColor(weight: number): string {
  if (weight > 0.7) return "#60a5fa";
  if (weight > 0.4) return "#a78bfa";
  return "#94a3b8";
}

function RotatingGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function WordCloudScene({ words }: WordCloudSceneProps) {
  const positions = fibonacciSphere(words.length, 5);

  return (
    <div className="word-cloud-canvas">
      <Canvas camera={{ position: [0, 0, 14], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <RotatingGroup>
          {words.map((w, i) => {
            const pos = positions[i]!;
            const size = weightToSize(w.weight);
            const color = weightToColor(w.weight);

            return (
              <Text
                key={w.word}
                position={pos}
                fontSize={size}
                color={color}
                anchorX="center"
                anchorY="middle"
              >
                {w.word}
              </Text>
            );
          })}
        </RotatingGroup>
        <OrbitControls enablePan={false} minDistance={6} maxDistance={24} />
      </Canvas>
    </div>
  );
}

export default WordCloudScene;
