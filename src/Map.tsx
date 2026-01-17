import { useState, useRef, useEffect } from "react";
import Map, { NavigationControl, Layer, Source } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CITIES } from "./config";
import MetroNetwork from "./MetroNetwork";
import Chat from "./Chat";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`;

export default function CityMap() {
  const mapRef = useRef<MapRef>(null);
  const [activeCityId, setActiveCityId] = useState("delhi");
  const activeCity = CITIES[activeCityId];

  useEffect(() => {
    if (mapRef.current) {
      const { longitude, latitude, zoom, pitch, bearing } =
        activeCity.viewState;
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom,
        pitch,
        bearing,
        duration: 3000,
        essential: true,
      });
    }
  }, [activeCityId]);

  if (!MAPTILER_KEY)
    return <div className="text-white p-10">⚠️ Missing MAPTILER KEY</div>;

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

        {/* PASS BBOX HERE */}
        <MetroNetwork bbox={activeCity.bbox} />
      </Map>

      {/* Scrollable City List */}
      <div className="absolute top-6 right-6 z-10 w-64 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin">
        <div className="flex flex-col gap-2 items-end">
          {Object.values(CITIES).map((city) => (
            <button
              key={city.id}
              onClick={() => setActiveCityId(city.id)}
              className={`
                px-4 py-2 rounded font-bold text-xs tracking-widest transition-all border backdrop-blur-md w-full text-right
                ${
                  activeCityId === city.id
                    ? "bg-cyan-600/80 text-white border-cyan-400 shadow-[0_0_15px_cyan]"
                    : "bg-black/70 text-gray-400 border-gray-700 hover:text-white hover:border-white"
                }
              `}
            >
              {city.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <Chat />
    </div>
  );
}
