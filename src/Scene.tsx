import { Canvas } from "@react-three/fiber";
import { CameraControls, CatmullRomLine, Grid } from "@react-three/drei"; // <--- Changed Import
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import {
  parseGeoJSON,
  parseStations,
  type MetroLineData,
  type MetroStationData,
} from "./utils/metroParser";
import Stations from "./Stations";
import Trains from "./Trains";
import UI from "./UI"; // <--- Import the new UI
import { CITIES, type CityConfig } from "./config";

const THEME = {
  black: "#050505",
  grid: "#1a1a1a",
};

const MetroLine = ({ data }: { data: MetroLineData }) => (
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

export default function Scene() {
  const [activeCityId, setActiveCityId] = useState<string>("delhi");
  const [lines, setLines] = useState<MetroLineData[]>([]);
  const [stations, setStations] = useState<MetroStationData[]>([]);
  const [loading, setLoading] = useState(false);

  // Ref for the Camera Controller
  const controlsRef = useRef<CameraControls>(null);

  const activeCity: CityConfig = CITIES[activeCityId];

  // 1. Load Data
  useEffect(() => {
    setLoading(true);
    setLines([]);
    setStations([]);

    const loadData = async () => {
      try {
        const [linesRes, stationsRes] = await Promise.all([
          fetch(activeCity.files.lines),
          fetch(activeCity.files.stations),
        ]);
        const linesJson = await linesRes.json();
        const stationsJson = await stationsRes.json();

        setLines(parseGeoJSON(linesJson, activeCity.anchor));
        setStations(parseStations(stationsJson, activeCity.anchor));

        // Reset Camera when city changes
        // fitToBox helps frame the new city instantly
        controlsRef.current?.setLookAt(0, 20, 20, 0, 0, 0, true);
      } catch (err) {
        console.error("Error loading city:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeCityId]);

  // 2. The Fly-To Logic
  const handleFocusStation = (station: MetroStationData) => {
    if (!controlsRef.current) return;

    // Position: Camera goes slightly above and offset from the station
    const x = station.position.x + 1; // Offset X
    const y = station.position.y + 2; // Height (Zoom level)
    const z = station.position.z + 1; // Offset Z

    // Target: Look directly at the station
    const tx = station.position.x;
    const ty = station.position.y;
    const tz = station.position.z;

    // Smoothly animate to this new angle (enableTransition = true)
    controlsRef.current.setLookAt(x, y, z, tx, ty, tz, true);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", background: THEME.black }}>
      <UI
        activeCityId={activeCityId}
        setActiveCityId={setActiveCityId}
        stations={stations}
        loading={loading}
        onFocusStation={handleFocusStation}
      />

      <Canvas camera={{ position: [20, 15, 20], fov: 45 }}>
        <color attach="background" args={[THEME.black]} />
        <fog attach="fog" args={[THEME.black, 20, 80]} />

        <group>
          {lines.map((line) => (
            <MetroLine key={line.id} data={line} />
          ))}
          <Stations data={stations} />
          <Trains lines={lines} />
        </group>

        <Grid
          position={[0, -2, 0]}
          args={[100, 100]}
          cellColor={THEME.grid}
          sectionColor={THEME.grid}
          fadeDistance={50}
        />

        {/* Replaced OrbitControls with CameraControls for animation support */}
        <CameraControls
          ref={controlsRef}
          minDistance={1}
          maxDistance={100}
          dollySpeed={0.5}
          smoothTime={0.5} // Smoothness of the fly-to animation
        />

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
