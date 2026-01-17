import { useState, useRef, useEffect } from "react";
import Map, { NavigationControl, Layer, Source } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl"; // <--- FIX IS HERE (Added 'type')
import "maplibre-gl/dist/maplibre-gl.css";
import { CITIES } from "./config";
import MetroNetwork from "./MetroNetwork";
import Chat from "./Chat"; // <--- NEW: Import Chat

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`;

export default function CityMap() {
  const mapRef = useRef<MapRef>(null);
  const [activeCityId, setActiveCityId] = useState("delhi");
  const activeCity = CITIES[activeCityId];

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        ...activeCity.viewState,
        duration: 3000,
        essential: true,
      });
    }
  }, [activeCityId]);

  if (!MAPTILER_KEY)
    return <div className="text-white p-10">⚠️ Missing VITE_MAPTILER_KEY</div>;

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        initialViewState={CITIES.delhi.viewState}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle={MAP_STYLE}
        terrain={{ source: "maptiler_planet", exaggeration: 1.5 }}
        maxPitch={85}
      >
        <NavigationControl position="bottom-right" />

        {/* 3D Buildings */}
        <Source
          id="openmaptiles"
          type="vector"
          url={`https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`}
        >
          <Layer
            id="3d-buildings"
            source-layer="building"
            type="fill-extrusion"
            minzoom={13}
            paint={{
              "fill-extrusion-color": "#1a1a1a",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                13,
                0,
                13.05,
                ["get", "render_height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                13,
                0,
                13.05,
                ["get", "render_min_height"],
              ],
              "fill-extrusion-opacity": 0.9,
            }}
          />
        </Source>

        {/* Metro Lines */}
        <MetroNetwork operatorId={activeCity.operatorId} />
      </Map>

      {/* UI: City Switcher */}
      <div className="absolute top-6 right-6 flex gap-2 z-10">
        {Object.values(CITIES).map((city) => (
          <button
            key={city.id}
            onClick={() => setActiveCityId(city.id)}
            className={`
              px-4 py-2 rounded font-bold text-xs tracking-widest transition-all border backdrop-blur-md
              ${
                activeCityId === city.id
                  ? "bg-cyan-600/80 text-white border-cyan-400 shadow-[0_0_20px_cyan]"
                  : "bg-black/60 text-gray-400 border-gray-700 hover:text-white"
              }
            `}
          >
            {city.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* UI: AI Chat */}
      <Chat />
    </div>
  );
}
