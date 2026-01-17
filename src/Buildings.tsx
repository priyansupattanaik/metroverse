import { useMemo } from "react";
import * as THREE from "three";

const MER_CONST = 20037508.34 / 180;
const forwardMercator = (lon: number, lat: number) => {
  const x = lon * MER_CONST;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = y * MER_CONST;
  return [x, y];
};

export default function Buildings({
  data,
  anchor,
}: {
  data: any;
  anchor: { lon: number; lat: number };
}) {
  const geometry = useMemo(() => {
    if (!data || !data.features) return null;
    const shapes: THREE.Shape[] = [];
    const [centerX, centerY] = forwardMercator(anchor.lon, anchor.lat);

    data.features.forEach((feature: any) => {
      if (feature.geometry.type === "Polygon") {
        const coords = feature.geometry.coordinates[0];
        const shape = new THREE.Shape();
        coords.forEach(([lon, lat]: number[], i: number) => {
          const [x, y] = forwardMercator(lon, lat);
          const nx = (x - centerX) / 1000;
          const ny = -(y - centerY) / 1000;
          if (i === 0) shape.moveTo(nx, ny);
          else shape.lineTo(nx, ny);
        });
        shapes.push(shape);
      }
    });
    return new THREE.ExtrudeGeometry(shapes, {
      depth: 0.5,
      bevelEnabled: false,
    });
  }, [data, anchor]);

  if (!geometry) return null;
  return (
    <mesh
      geometry={geometry}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, -2, 0]}
    >
      <meshStandardMaterial color="#111" transparent opacity={0.9} />
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#333" />
      </lineSegments>
    </mesh>
  );
}
