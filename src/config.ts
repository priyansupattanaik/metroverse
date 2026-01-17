export type CityConfig = {
  id: string;
  name: string;
  label: string;
  anchor: { lon: number; lat: number };
  files: {
    lines: string;
    stations: string;
  };
};

export const CITIES: Record<string, CityConfig> = {
  delhi: {
    id: "delhi",
    name: "Delhi Metro",
    label: "DEL",
    anchor: { lon: 77.209, lat: 28.6139 }, // Connaught Place
    files: {
      lines: "/delhi_metro.geojson",
      stations: "/delhi_stations.geojson",
    },
  },
  mumbai: {
    id: "mumbai",
    name: "Mumbai Metro",
    label: "BOM",
    anchor: { lon: 72.8777, lat: 19.076 }, // BKC / Center
    files: {
      lines: "/mumbai_metro.geojson",
      stations: "/mumbai_stations.geojson",
    },
  },
  bangalore: {
    id: "bangalore",
    name: "Namma Metro",
    label: "BLR",
    anchor: { lon: 77.5946, lat: 12.9716 }, // Cubbon Park
    files: {
      lines: "/bangalore_metro.geojson",
      stations: "/bangalore_stations.geojson",
    },
  },
};
