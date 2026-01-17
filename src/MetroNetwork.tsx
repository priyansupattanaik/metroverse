import { Source, Layer } from "react-map-gl/maplibre";
import { useTransitData } from "./useTransitData";

export default function MetroNetwork({ operatorId }: { operatorId: string }) {
  const { data } = useTransitData(operatorId);

  if (!data) return null;

  return (
    <Source id="metro-data" type="geojson" data={data}>
      {/* 1. The Neon Glow (Blurry & Wide) */}
      <Layer
        id="line-glow"
        type="line"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={{
          "line-color": ["get", "color"],
          "line-width": 12,
          "line-opacity": 0.4,
          "line-blur": 4,
        }}
      />

      {/* 2. The Core Line (Sharp & Bright) */}
      <Layer
        id="line-core"
        type="line"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={{
          "line-color": ["get", "color"],
          "line-width": 3,
          "line-opacity": 1.0,
        }}
      />
    </Source>
  );
}
