import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { type MetroLineData } from "./utils/metroParser";

// CONFIG
const TRAIN_LENGTH = 0.05; // Size of the capsule
const TRAIN_SPEED_BASE = 0.1; // Base speed multiplier
const TRAIN_COUNT_PER_LINE = 1; // How many trains per segment?

// Individual Train Component
const Train = ({
  curve,
  color,
}: {
  curve: THREE.CatmullRomCurve3;
  color: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Random starting position (0 to 1) so they don't all start at once
  // Random speed variance so they don't look robotic
  const [state] = useState(() => ({
    progress: Math.random(),
    speed: (Math.random() * 0.5 + 0.5) * TRAIN_SPEED_BASE, // Random speed 0.5x to 1.0x
    direction: Math.random() > 0.5 ? 1 : -1, // Some go forward, some backward
  }));

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // 1. Update Progress
    // We divide delta by curve length so speed is constant regardless of line length
    // (Longer lines shouldn't make trains move faster)
    const moveAmount = (delta * state.speed) / (curve.getLength() / 1000);

    state.progress += moveAmount * state.direction;

    // 2. Loop Logic (Ping Pong or Reset)
    if (state.progress > 1) {
      state.progress = 0;
    } else if (state.progress < 0) {
      state.progress = 1;
    }

    // 3. Move the mesh
    const point = curve.getPointAt(state.progress);
    const tangent = curve.getTangentAt(state.progress); // Which way is forward?

    meshRef.current.position.copy(point);

    // 4. Rotate to face the path
    // We look at a point slightly ahead to align the capsule
    const lookAtPoint = point.clone().add(tangent);
    meshRef.current.lookAt(lookAtPoint);
  });

  return (
    <mesh ref={meshRef}>
      {/* A Capsule Geometry (Radius, Length) */}
      <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};

// Main Component
export default function Trains({ lines }: { lines: MetroLineData[] }) {
  // 1. Process Lines into Curves (Memoized for performance)
  // We only want to run this math once when 'lines' data changes.
  const trainRoutes = useMemo(() => {
    const routes: {
      id: string;
      curve: THREE.CatmullRomCurve3;
      color: string;
    }[] = [];

    lines.forEach((line) => {
      // Filter out tiny connector segments (less than 2 points cannot form a curve)
      if (line.points.length < 2) return;

      const curve = new THREE.CatmullRomCurve3(line.points);

      // Add a train for this segment
      routes.push({
        id: line.id,
        curve: curve,
        color: line.color === "#FFFFFF" ? "#00FFFF" : line.color, // Default white lines to Cyan for effect
      });
    });

    return routes;
  }, [lines]);

  return (
    <group>
      {trainRoutes.map((route, i) => (
        <Train
          key={`${route.id}-${i}`}
          curve={route.curve}
          color={route.color}
        />
      ))}
    </group>
  );
}
