import { Canvas } from "@react-three/fiber";
import { CameraControls, CatmullRomLine, Grid } from "@react-three/drei";
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
import UI from "./UI";
import Chat from "./Chat"; // <--- AI Component
import Buildings from "./Buildings"; // <--- 3D Map Component
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
  const [buildings, setBuildings] = useState<any>(null); // <--- State for Building Data
  const [loading, setLoading] = useState(false);

  const controlsRef = useRef<CameraControls>(null);
  const activeCity: CityConfig = CITIES[activeCityId];

  // Load Data Effect
  useEffect(() => {
    setLoading(true);
    // Clear old data to prevent visual glitches during switch
    setLines([]);
    setStations([]);
    setBuildings(null);

    const loadData = async () => {
      try {
        console.log(`Fetching data for ${activeCity.name}...`);

        // Fetch Lines, Stations, AND Buildings in parallel
        const [linesRes, stationsRes, buildRes] = await Promise.all([
          fetch(activeCity.files.lines),
          fetch(activeCity.files.stations),
          // Check if buildings file is defined in config before fetching
          activeCity.files.buildings
            ? fetch(activeCity.files.buildings)
            : Promise.resolve(null),
        ]);

        if (!linesRes.ok || !stationsRes.ok)
          throw new Error("Failed to load Metro data");

        const linesJson = await linesRes.json();
        const stationsJson = await stationsRes.json();
        const buildJson =
          buildRes && buildRes.ok ? await buildRes.json() : null;

        setLines(parseGeoJSON(linesJson, activeCity.anchor));
        setStations(parseStations(stationsJson, activeCity.anchor));
        setBuildings(buildJson);

        // Reset Camera to "God View"
        controlsRef.current?.setLookAt(0, 20, 20, 0, 0, 0, true);
      } catch (err) {
        console.error("Critical Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeCityId]);

  // Fly-To Logic for Search
  const handleFocusStation = (station: MetroStationData) => {
    if (!controlsRef.current) return;

    // Smoothly fly to the station
    controlsRef.current.setLookAt(
      station.position.x + 1, // Camera X
      station.position.y + 2, // Camera Y (Zoom height)
      station.position.z + 1, // Camera Z
      station.position.x, // Target X
      station.position.y, // Target Y
      station.position.z, // Target Z
      true, // Enable Transition
    );
  };

  return (
    <div style={{ height: "100vh", width: "100vw", background: THEME.black }}>
      {/* 1. The UI Layer (Search + City Switcher) */}
      <UI
        activeCityId={activeCityId}
        setActiveCityId={setActiveCityId}
        stations={stations}
        loading={loading}
        onFocusStation={handleFocusStation}
      />

      {/* 2. The AI Chat Interface */}
      <Chat city={activeCity.name} />

      {/* 3. The 3D Scene */}
      <Canvas camera={{ position: [20, 15, 20], fov: 45 }}>
        <color attach="background" args={[THEME.black]} />
        <fog attach="fog" args={[THEME.black, 10, 80]} />

        <group>
          {lines.map((line) => (
            <MetroLine key={line.id} data={line} />
          ))}
          <Stations data={stations} />
          <Trains lines={lines} />
          {/* Render buildings if data exists */}
          {buildings && (
            <Buildings data={buildings} anchor={activeCity.anchor} />
          )}
        </group>

        <Grid
          position={[0, -2, 0]}
          args={[100, 100]}
          cellColor={THEME.grid}
          sectionColor={THEME.grid}
          fadeDistance={50}
        />

        <CameraControls
          ref={controlsRef}
          minDistance={1}
          maxDistance={100}
          smoothTime={0.5}
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
