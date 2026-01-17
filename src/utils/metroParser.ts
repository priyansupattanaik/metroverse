import * as THREE from "three";

// Standard Mercator Projection
const MER_CONST = 20037508.34 / 180;
const forwardMercator = (lon: number, lat: number) => {
  const x = lon * MER_CONST;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = y * MER_CONST;
  return [x, y];
};

const ELEVATION_MAP: Record<string, number> = {
  "#FFC520": -8,
  "#F58220": -8, // Yellow/Orange (Underground)
  "#FF69B4": 10,
  "#0000FF": 10,
  "#800080": 10, // Pink/Blue/Violet (Elevated)
  "#FF0000": 4,
  "#008000": 4, // Red/Green (Ground/Mix)
};

// IMPROVED: Robust Name Extractor
const getName = (props: any) => {
  if (!props) return "Unknown";
  return (
    props["name:en"] ||
    props["name"] ||
    props["station"] ||
    props["official_name"] ||
    "Unknown Station"
  );
};

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

export const parseGeoJSON = (
  json: any,
  anchor: { lon: number; lat: number },
): MetroLineData[] => {
  const lines: MetroLineData[] = [];
  if (!json || !json.features) return [];

  const [centerX, centerY] = forwardMercator(anchor.lon, anchor.lat);

  json.features.forEach((feature: any, index: number) => {
    if (feature.geometry.type === "LineString") {
      const color =
        feature.properties.colour || feature.properties.color || "#FFFFFF";
      const elevation = ELEVATION_MAP[color.toUpperCase()] || 0;

      const points = feature.geometry.coordinates.map(
        ([lon, lat]: number[]) => {
          const [x, y] = forwardMercator(lon, lat);
          return new THREE.Vector3(
            (x - centerX) / 1000,
            elevation,
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

export const parseStations = (
  json: any,
  anchor: { lon: number; lat: number },
): MetroStationData[] => {
  const stations: MetroStationData[] = [];
  if (!json || !json.features) return [];

  const [centerX, centerY] = forwardMercator(anchor.lon, anchor.lat);

  json.features.forEach((feature: any, index: number) => {
    // Some OSM exports use "Point", others use "Node"
    if (feature.geometry.type === "Point") {
      const [lon, lat] = feature.geometry.coordinates;
      const [x, y] = forwardMercator(lon, lat);

      const name = getName(feature.properties);

      // Filter out points that are "subway_entrance" but not actual stations if possible
      // (Optional logic: if name is just "Exit 2", ignore it)

      stations.push({
        id: feature.id || `stn-${index}`,
        name: name,
        position: new THREE.Vector3(
          (x - centerX) / 1000,
          2,
          -(y - centerY) / 1000,
        ),
      });
    }
  });
  return stations;
};
