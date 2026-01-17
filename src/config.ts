export type CityConfig = {
  id: string;
  name: string;
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  operatorId: string;
};

export const CITIES: Record<string, CityConfig> = {
  delhi: {
    id: "delhi",
    name: "Delhi Metro",
    viewState: {
      longitude: 77.209,
      latitude: 28.6139,
      zoom: 11,
      pitch: 50,
      bearing: 0,
    },
    operatorId: "o-ttnf-delhimetrorailcorporation", // DMRC ID
  },
  mumbai: {
    id: "mumbai",
    name: "Mumbai Metro",
    viewState: {
      longitude: 72.8777,
      latitude: 19.076,
      zoom: 11,
      pitch: 50,
      bearing: -20,
    },
    operatorId: "o-te7-mumbaimetrooneprivate", // Line 1 ID
  },
  bangalore: {
    id: "bangalore",
    name: "Namma Metro",
    viewState: {
      longitude: 77.5946,
      latitude: 12.9716,
      zoom: 11,
      pitch: 50,
      bearing: 0,
    },
    operatorId: "o-tdr-bangaloremetro", // BMRCL ID
  },
};
