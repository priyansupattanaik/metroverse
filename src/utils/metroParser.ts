import * as THREE from "three";

// 1. Fixed Anchor Point (Connaught Place)
const ANCHOR = { lon: 77.209, lat: 28.6139 };

// 2. Elevation Config (The "Z-Axis" Logic)
// Maps line colors (hex) to height levels.
const ELEVATION_MAP: Record<string, number> = {
  // Underground Lines (Yellow, Orange)
  "#FFC520": -8, // Yellow
  "#F58220": -8, // Orange

  // Elevated Lines (Pink, Blue, Magenta)
  "#FF69B4": 10, // Pink
  "#0000FF": 10, // Blue
  "#800080": 10, // Violet/Magenta

  // Ground/Mix (Red, Green)
  "#FF0000": 4, // Red
  "#008000": 4, // Green
};

const MER_CONST = 20037508.34 / 180;
const forwardMercator = (lon: number, lat: number) => {
  const x = lon * MER_CONST;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = y * MER_CONST;
  return [x, y];
};

const [centerX, centerY] = forwardMercator(ANCHOR.lon, ANCHOR.lat);

export type MetroLineData = {
  id: string;
  name: string;
  color: string;
  points: THREE.Vector3[];
};

export type MetroStationData = {
  id: string;
  name: string;
  position: THREE.Vector3;
};

// Helper: Fix messy OSM names
const getName = (props: any) => {
  return (
    props["name:en"] ||
    props.name ||
    props.station ||
    props.description ||
    "Unknown Station"
  );
};

// Helper: Get elevation based on color (fuzzy match)
const getElevation = (color: string) => {
  // Normalize color to uppercase
  const c = color.toUpperCase();
  // Check exact match or fallback to 0
  return ELEVATION_MAP[c] || 0;
};

export const parseGeoJSON = (json: any): MetroLineData[] => {
  const lines: MetroLineData[] = [];
  if (!json.features) return [];

  json.features.forEach((feature: any, index: number) => {
    if (feature.geometry.type === "LineString") {
      const color =
        feature.properties.colour || feature.properties.color || "#FFFFFF";
      const elevation = getElevation(color);

      const points = feature.geometry.coordinates.map(
        ([lon, lat]: number[]) => {
          const [x, y] = forwardMercator(lon, lat);
          return new THREE.Vector3(
            (x - centerX) / 1000,
            elevation, // Apply height!
            -(y - centerY) / 1000,
          );
        },
      );

      lines.push({
        id: feature.id || `line-${index}`,
        name: getName(feature.properties),
        color: color,
        points: points,
      });
    }
  });
  return lines;
};

export const parseStations = (json: any): MetroStationData[] => {
  const stations: MetroStationData[] = [];
  if (!json.features) return [];

  json.features.forEach((feature: any, index: number) => {
    if (feature.geometry.type === "Point") {
      const [lon, lat] = feature.geometry.coordinates;
      const [x, y] = forwardMercator(lon, lat);

      // Note: Accurately mapping Station Height requires checking which line it belongs to.
      // For this step, we put them at a "neutral" floating height (2) or check properties.
      // A more advanced version would raycast to the nearest line to snap height.
      const baseHeight = 2;

      stations.push({
        id: feature.id || `stn-${index}`,
        name: getName(feature.properties),
        position: new THREE.Vector3(
          (x - centerX) / 1000,
          baseHeight,
          -(y - centerY) / 1000,
        ),
      });
    }
  });
  return stations;
};
