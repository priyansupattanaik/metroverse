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
  bbox: string; // We use BBOX now, NOT operatorId
};

export const CITIES: Record<string, CityConfig> = {
  delhi: {
    id: "delhi",
    name: "Delhi NCR",
    viewState: {
      longitude: 77.209,
      latitude: 28.6139,
      zoom: 11,
      pitch: 50,
      bearing: 0,
    },
    bbox: "76.82,28.35,77.50,28.88",
  },
  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    viewState: {
      longitude: 72.8777,
      latitude: 19.076,
      zoom: 11,
      pitch: 50,
      bearing: -20,
    },
    bbox: "72.78,18.88,73.12,19.30",
  },
  bangalore: {
    id: "bangalore",
    name: "Bengaluru",
    viewState: {
      longitude: 77.5946,
      latitude: 12.9716,
      zoom: 11,
      pitch: 50,
      bearing: 0,
    },
    bbox: "77.45,12.80,77.78,13.10",
  },
  hyderabad: {
    id: "hyderabad",
    name: "Hyderabad",
    viewState: {
      longitude: 78.4867,
      latitude: 17.385,
      zoom: 11,
      pitch: 50,
      bearing: 0,
    },
    bbox: "78.30,17.25,78.60,17.55",
  },
  chennai: {
    id: "chennai",
    name: "Chennai",
    viewState: {
      longitude: 80.2707,
      latitude: 13.0827,
      zoom: 11,
      pitch: 50,
      bearing: 0,
    },
    bbox: "80.05,12.90,80.35,13.20",
  },
  kolkata: {
    id: "kolkata",
    name: "Kolkata",
    viewState: {
      longitude: 88.3639,
      latitude: 22.5726,
      zoom: 11.5,
      pitch: 50,
      bearing: 0,
    },
    bbox: "88.25,22.40,88.55,22.75",
  },
  pune: {
    id: "pune",
    name: "Pune",
    viewState: {
      longitude: 73.8567,
      latitude: 18.5204,
      zoom: 11.5,
      pitch: 50,
      bearing: 0,
    },
    bbox: "73.72,18.42,73.98,18.65",
  },
  jaipur: {
    id: "jaipur",
    name: "Jaipur",
    viewState: {
      longitude: 75.7873,
      latitude: 26.9124,
      zoom: 12,
      pitch: 50,
      bearing: 0,
    },
    bbox: "75.70,26.80,75.88,27.00",
  },
  ahmedabad: {
    id: "ahmedabad",
    name: "Ahmedabad",
    viewState: {
      longitude: 72.5714,
      latitude: 23.0225,
      zoom: 11.5,
      pitch: 50,
      bearing: 0,
    },
    bbox: "72.45,22.95,72.70,23.12",
  },
  kochi: {
    id: "kochi",
    name: "Kochi",
    viewState: {
      longitude: 76.2673,
      latitude: 9.9312,
      zoom: 12,
      pitch: 50,
      bearing: 0,
    },
    bbox: "76.22,9.90,76.38,10.12",
  },
  lucknow: {
    id: "lucknow",
    name: "Lucknow",
    viewState: {
      longitude: 80.9462,
      latitude: 26.8467,
      zoom: 11.5,
      pitch: 50,
      bearing: 0,
    },
    bbox: "80.85,26.70,81.02,26.92",
  },
};
