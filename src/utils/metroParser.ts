import * as THREE from "three";

// NOTE: Hardcoded ANCHOR is removed. We now accept it as an argument.

const MER_CONST = 20037508.34 / 180;
const forwardMercator = (lon: number, lat: number) => {
  const x = lon * MER_CONST;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = y * MER_CONST;
  return [x, y];
};

// Elevation Config
const ELEVATION_MAP: Record<string, number> = {
  "#FFC520": -8,
  "#F58220": -8, // Underground
  "#FF69B4": 10,
  "#0000FF": 10,
  "#800080": 10, // Elevated
  "#FF0000": 4,
  "#008000": 4, // Ground
};

const getName = (props: any) => {
  return props["name:en"] || props.name || props.station || "Unknown Station";
};

const getElevation = (color: string) => {
  return ELEVATION_MAP[color.toUpperCase()] || 0;
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

// Updated: Now requires 'anchor'
export const parseGeoJSON = (
  json: any,
  anchor: { lon: number; lat: number },
): MetroLineData[] => {
  const lines: MetroLineData[] = [];
  if (!json.features) return [];

  const [centerX, centerY] = forwardMercator(anchor.lon, anchor.lat);

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

// Updated: Now requires 'anchor'
export const parseStations = (
  json: any,
  anchor: { lon: number; lat: number },
): MetroStationData[] => {
  const stations: MetroStationData[] = [];
  if (!json.features) return [];

  const [centerX, centerY] = forwardMercator(anchor.lon, anchor.lat);

  json.features.forEach((feature: any, index: number) => {
    if (feature.geometry.type === "Point") {
      const [lon, lat] = feature.geometry.coordinates;
      const [x, y] = forwardMercator(lon, lat);

      stations.push({
        id: feature.id || `stn-${index}`,
        name: getName(feature.properties),
        position: new THREE.Vector3(
          (x - centerX) / 1000,
          2, // Floating height
          -(y - centerY) / 1000,
        ),
      });
    }
  });
  return stations;
};
