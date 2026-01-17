import { useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { parseStations, type MetroStationData } from "./utils/metroParser";
import { Html } from "@react-three/drei";

export default function Stations() {
  const [stations, setStations] = useState<MetroStationData[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  // The Mesh that will be cloned
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  // 1. Load Station Data
  useLayoutEffect(() => {
    fetch("/delhi_stations.geojson")
      .then((res) => res.json())
      .then((data) => {
        const parsed = parseStations(data);
        setStations(parsed);
      })
      .catch((err) => console.error("Could not load station data:", err));
  }, []);

  // 2. Position the Instances
  useLayoutEffect(() => {
    if (!meshRef.current || stations.length === 0) return;

    stations.forEach((station, i) => {
      dummy.position.copy(station.position);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [stations]);

  // 3. Hover Interaction
  const handlePointerMove = (e: any) => {
    // e.instanceId tells us exactly WHICH dot we hit
    const id = e.instanceId;
    if (id !== undefined && stations[id]) {
      setHovered(stations[id].name);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = () => {
    setHovered(null);
    document.body.style.cursor = "default";
  };

  if (stations.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, stations.length]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        {/* Geometry: Low poly sphere for performance */}
        <sphereGeometry args={[0.15, 10, 10]} />

        {/* Material: Bright White Glow */}
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      {/* 4. The Tooltip UI */}
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
