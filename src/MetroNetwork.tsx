import { useState, memo } from "react";
import { Source, Layer, Popup } from "react-map-gl/maplibre";
import { useTransitData } from "./useTransitData";

const MetroNetwork = memo(function MetroNetwork({ bbox }: { bbox: string }) {
  const { routes, stops, status } = useTransitData(bbox);
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  if (!routes || status === "LOADING") {
    return (
      <div className="absolute top-6 left-6 z-20 bg-black/80 border border-cyan-500/50 text-cyan-400 px-4 py-2 rounded text-xs font-mono animate-pulse shadow-[0_0_10px_cyan]">
        SCANNING METRO...
      </div>
    );
  }

  if (status === "EMPTY" || status === "ERROR") {
    return (
      <div className="absolute top-6 left-6 z-20 bg-red-900/90 border border-red-500 text-white px-4 py-2 rounded text-xs font-mono shadow-[0_0_10px_red]">
        NO METRO DATA FOUND
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-6 left-6 z-20 bg-black/80 border border-green-500/50 text-green-400 px-4 py-2 rounded text-xs font-mono shadow-[0_0_10px_green]">
        ONLINE: {routes.features.length} LINES
      </div>

      <Source id="metro-routes" type="geojson" data={routes}>
        <Layer
          id="line-glow"
          type="line"
          layout={{ "line-join": "round", "line-cap": "round" }}
          paint={{
            "line-color": ["get", "color"],
            "line-width": 10,
            "line-opacity": 0.5,
            "line-blur": 5,
          }}
        />
        <Layer
          id="line-core"
          type="line"
          layout={{ "line-join": "round", "line-cap": "round" }}
          paint={{
            "line-color": ["get", "color"],
            "line-width": 3,
            "line-opacity": 1,
          }}
        />
      </Source>

      {stops && (
        <Source id="metro-stops" type="geojson" data={stops}>
          <Layer
            id="station-dots"
            type="circle"
            paint={{
              "circle-radius": 4,
              "circle-color": "#FFFFFF",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#000000",
              "circle-pitch-alignment": "viewport",
            }}
          />
          <Layer
            id="station-hitbox"
            type="circle"
            paint={{
              "circle-radius": 12,
              "circle-color": "transparent",
              "circle-pitch-alignment": "viewport",
            }}
            onMouseEnter={(e: any) => {
              const f = e.features[0];
              setHoverInfo({
                longitude: f.geometry.coordinates[0],
                latitude: f.geometry.coordinates[1],
                name: f.properties.name,
              });
              e.target.getCanvas().style.cursor = "pointer";
            }}
            onMouseLeave={(e: any) => {
              setHoverInfo(null);
              e.target.getCanvas().style.cursor = "";
            }}
          />
        </Source>
      )}

      {hoverInfo && (
        <Popup
          longitude={hoverInfo.longitude}
          latitude={hoverInfo.latitude}
          closeButton={false}
          closeOnClick={false}
          offset={10}
          maxWidth="300px"
        >
          <div className="bg-black/90 border border-cyan-500 p-2 rounded text-white shadow-[0_0_15px_cyan]">
            <div className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
              STATION
            </div>
            <div className="text-sm font-bold">{hoverInfo.name}</div>
          </div>
        </Popup>
      )}
    </>
  );
});

export default MetroNetwork;
