import { useState, useMemo } from "react";
import { CITIES, type CityConfig } from "./config";
import { type MetroStationData } from "./utils/metroParser";

type UIProps = {
  activeCityId: string;
  setActiveCityId: (id: string) => void;
  stations: MetroStationData[];
  onFocusStation: (station: MetroStationData) => void;
  loading: boolean;
};

export default function UI({
  activeCityId,
  setActiveCityId,
  stations,
  onFocusStation,
  loading,
}: UIProps) {
  const activeCity = CITIES[activeCityId];
  const [search, setSearch] = useState("");

  // Filter stations based on search text
  const matches = useMemo(() => {
    if (search.length < 2) return [];
    return stations
      .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5); // Limit to top 5 results
  }, [search, stations]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col p-6 z-10">
      {/* Header & City Switcher */}
      <div className="pointer-events-auto flex flex-col gap-4 items-start">
        <h1
          className="text-white text-5xl font-black tracking-tighter drop-shadow-lg"
          style={{ fontFamily: "Arial Black, sans-serif" }}
        >
          METRO<span className="text-cyan-400">VERSE</span>
        </h1>

        <div className="flex gap-2 bg-black/50 backdrop-blur-md p-1 rounded-lg border border-white/10">
          {Object.values(CITIES).map((city) => (
            <button
              key={city.id}
              onClick={() => {
                setActiveCityId(city.id);
                setSearch("");
              }}
              className={`
                px-4 py-2 rounded font-bold text-xs tracking-widest transition-all
                ${
                  activeCityId === city.id
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              {city.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="pointer-events-auto mt-6 w-full max-w-sm relative">
        <input
          type="text"
          placeholder={`Search ${activeCity.name}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/80 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all placeholder:text-gray-600"
        />

        {/* Search Results Dropdown */}
        {matches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-white/20 rounded-lg overflow-hidden backdrop-blur-xl">
            {matches.map((station) => (
              <button
                key={station.id}
                onClick={() => {
                  onFocusStation(station);
                  setSearch(""); // Clear search after selection
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-cyan-900/50 hover:text-cyan-400 border-b border-white/5 last:border-0 transition-colors flex justify-between items-center"
              >
                {station.name}
                <span className="text-[10px] text-gray-600 bg-gray-900 px-1 rounded">
                  STATION
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-auto text-gray-500 text-xs font-mono">
        {loading
          ? "DOWNLOADING TOPOLOGY..."
          : `SYSTEM ONLINE: ${stations.length} NODES`}
      </div>
    </div>
  );
}
