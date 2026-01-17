export type CityConfig = {
  id: string;
  name: string;
  label: string;
  anchor: { lon: number; lat: number };
  files: { lines: string; stations: string; buildings: string }; // <--- Added buildings
};

export const CITIES: Record<string, CityConfig> = {
  delhi: {
    id: "delhi",
    name: "Delhi Metro",
    label: "DEL",
    anchor: { lon: 77.209, lat: 28.6139 },
    files: {
      lines: "/delhi_metro.geojson",
      stations: "/delhi_stations.geojson",
      buildings: "/delhi_buildings.geojson", // <--- New
    },
  },
  mumbai: {
    id: "mumbai",
    name: "Mumbai Metro",
    label: "BOM",
    anchor: { lon: 72.8777, lat: 19.076 },
    files: {
      lines: "/mumbai_metro.geojson",
      stations: "/mumbai_stations.geojson",
      buildings: "/mumbai_buildings.geojson", // <--- New
    },
  },
  bangalore: {
    id: "bangalore",
    name: "Namma Metro",
    label: "BLR",
    anchor: { lon: 77.5946, lat: 12.9716 },
    files: {
      lines: "/bangalore_metro.geojson",
      stations: "/bangalore_stations.geojson",
      buildings: "/bangalore_buildings.geojson", // <--- New
    },
  },
};
