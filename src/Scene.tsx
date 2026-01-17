import { Canvas } from "@react-three/fiber";
import { OrbitControls, CatmullRomLine, Grid } from "@react-three/drei"; // Added Grid
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useEffect, useState } from "react";
import { parseGeoJSON, type MetroLineData } from "./utils/metroParser";
import Stations from "./Stations";

const THEME = {
  black: "#050505",
  grid: "#1a1a1a",
};

const MetroLine = ({ data }: { data: MetroLineData }) => {
  return (
    <CatmullRomLine
      points={data.points}
      closed={false}
      curveType="catmullrom"
      tension={0.5}
      lineWidth={3}
      color={data.color}
    >
      <meshBasicMaterial color={data.color} toneMapped={false} />
    </CatmullRomLine>
  );
};

export default function Scene() {
  const [lines, setLines] = useState<MetroLineData[]>([]);

  useEffect(() => {
    fetch("/delhi_metro.geojson")
      .then((res) => res.json())
      .then((data) => setLines(parseGeoJSON(data)))
      .catch(console.error);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", background: THEME.black }}>
      {/* Lower the camera angle to see the height differences */}
      <Canvas camera={{ position: [20, 10, 20], fov: 45 }}>
        <color attach="background" args={[THEME.black]} />
        <fog attach="fog" args={[THEME.black, 20, 80]} />

        <group>
          {lines.map((line) => (
            <MetroLine key={line.id} data={line} />
          ))}
          <Stations />
        </group>

        {/* 1. The Reference Floor (Zero Level) */}
        {/* This helps the user see what is "Up" and what is "Down" */}
        <Grid
          position={[0, -2, 0]}
          args={[100, 100]}
          cellColor={THEME.grid}
          sectionColor={THEME.grid}
          fadeDistance={50}
        />

        <OrbitControls makeDefault minDistance={5} maxDistance={100} />
        <ambientLight intensity={0.5} />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.4}
            intensity={1.5}
            levels={9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
