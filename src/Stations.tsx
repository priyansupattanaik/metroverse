import { useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { type MetroStationData } from "./utils/metroParser";
import { Html } from "@react-three/drei";

// Receives data as a prop instead of fetching it internally
export default function Stations({ data }: { data: MetroStationData[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  useLayoutEffect(() => {
    if (!meshRef.current || data.length === 0) return;

    // Critical: Update the instance count when city changes
    meshRef.current.count = data.length;

    data.forEach((station, i) => {
      dummy.position.copy(station.position);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  const handlePointerMove = (e: any) => {
    const id = e.instanceId;
    if (id !== undefined && data[id]) {
      setHovered(data[id].name);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = () => {
    setHovered(null);
    document.body.style.cursor = "default";
  };

  if (data.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, data.length]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      {hovered && (
        <Html position={[0, 0, 0]} wrapperClass="pointer-events-none">
          <div
            className="
            bg-black/90 text-white p-3 rounded-lg border border-cyan-500/50 
            shadow-[0_0_15px_rgba(0,255,255,0.3)]
            text-sm whitespace-nowrap transform translate-x-4 -translate-y-4
            font-mono tracking-wide
          "
          >
            <div className="text-cyan-400 text-xs font-bold mb-1">
              STATION NODE
            </div>
            {hovered}
          </div>
        </Html>
      )}
    </group>
  );
}
