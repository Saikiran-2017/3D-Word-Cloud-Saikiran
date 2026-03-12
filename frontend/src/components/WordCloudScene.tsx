import { useRef, useState, useCallback } from "react";
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
  return 0.25 + weight * 1.1;
}

function weightToColor(weight: number): string {
  if (weight > 0.7) return "#60a5fa";
  if (weight > 0.4) return "#a78bfa";
  return "#94a3b8";
}

const HOVER_COLOR = "#f0f0ff";

interface WordMeshProps {
  text: string;
  position: [number, number, number];
  fontSize: number;
  color: string;
}

function WordMesh({ text, position, fontSize, color }: WordMeshProps) {
  const [hovered, setHovered] = useState(false);

  const onOver = useCallback(() => {
    setHovered(true);
    document.body.style.cursor = "pointer";
  }, []);

  const onOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={hovered ? HOVER_COLOR : color}
      anchorX="center"
      anchorY="middle"
      scale={hovered ? 1.25 : 1}
      onPointerOver={onOver}
      onPointerOut={onOut}
    >
      {text}
    </Text>
  );
}

function RotatingGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function WordCloudScene({ words }: WordCloudSceneProps) {
  const positions = fibonacciSphere(words.length, 6);

  return (
    <div className="word-cloud-canvas">
      <Canvas camera={{ position: [0, 0, 16], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <RotatingGroup>
          {words.map((w, i) => (
            <WordMesh
              key={w.word}
              text={w.word}
              position={positions[i]!}
              fontSize={weightToSize(w.weight)}
              color={weightToColor(w.weight)}
            />
          ))}
        </RotatingGroup>
        <OrbitControls enablePan={false} minDistance={8} maxDistance={28} />
      </Canvas>
    </div>
  );
}

export default WordCloudScene;
