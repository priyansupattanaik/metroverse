import { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_TRANSITLAND_KEY;
// Cache for 24 hours
const CACHE_DURATION = 1000 * 60 * 60 * 24;

export function useTransitData(bbox: string) {
  const [routes, setRoutes] = useState<any>(null);
  const [stops, setStops] = useState<any>(null);
  const [status, setStatus] = useState<string>("IDLE");

  useEffect(() => {
    // Safety Check: If bbox is missing (due to config error), stop here.
    if (!bbox) {
      console.warn("⚠️ BBOX is undefined. Check src/config.ts");
      setStatus("ERROR");
      return;
    }

    if (!API_KEY) {
      console.error("❌ Missing VITE_TRANSITLAND_KEY in .env");
      setStatus("ERROR");
      return;
    }

    const loadData = async () => {
      setStatus("LOADING");
      // New Cache Key to force refresh
      const cacheKey = `metro_bbox_v8_strict_${bbox}`;

      // 1. Check LocalStorage
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          if (
            Date.now() - timestamp < CACHE_DURATION &&
            data.routes?.features?.length > 0
          ) {
            console.log(
              `⚡ Loaded Cache: ${data.routes.features.length} lines`,
            );
            setRoutes(data.routes);
            setStops(data.stops);
            setStatus("SUCCESS");
            return;
          }
        }
      } catch (e) {
        console.warn("Cache ignored");
      }

      // 2. Fetch Live Data
      try {
        console.log(`🌐 Scanning Metro in: ${bbox}`);

        const [routesRes, stopsRes] = await Promise.all([
          // Request Routes with vehicle_type=1 (Subway)
          axios.get("https://transit.land/api/v2/rest/routes", {
            params: {
              bbox: bbox,
              vehicle_type: 1, // STRICT MODE: 1 = Subway/Metro
              include_geometry: true,
              limit: 200,
            },
            headers: { apikey: API_KEY },
          }),
          // Request Stops
          axios.get("https://transit.land/api/v2/rest/stops", {
            params: {
              bbox: bbox,
              vehicle_type: 1,
              limit: 1000,
            },
            headers: { apikey: API_KEY },
          }),
        ]);

        // Double Filter Client-Side (Just in case API sends Buses)
        const validRoutes = routesRes.data.routes.filter(
          (r: any) => r.route_type === 1,
        );

        console.log(`✅ API Returned: ${routesRes.data.routes.length} items.`);
        console.log(`🚇 Valid Metros: ${validRoutes.length} items.`);

        const routeFeatures = validRoutes.map((route: any) => ({
          type: "Feature",
          geometry: route.geometry,
          properties: {
            name: route.route_long_name || route.route_short_name,
            color: route.route_color ? `#${route.route_color}` : "#00FFFF",
          },
        }));

        // Process Stops (Remove duplicates)
        const uniqueStops = new Map();
        for (const stop of stopsRes.data.stops) {
          if (stop.geometry && !uniqueStops.has(stop.onestop_id)) {
            uniqueStops.set(stop.onestop_id, {
              type: "Feature",
              geometry: stop.geometry,
              properties: { name: stop.stop_name, id: stop.onestop_id },
            });
          }
        }
        const stopFeatures = Array.from(uniqueStops.values());

        const routeData = {
          type: "FeatureCollection",
          features: routeFeatures,
        };
        const stopData = { type: "FeatureCollection", features: stopFeatures };

        // Only save if we actually found lines
        if (routeFeatures.length > 0) {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              timestamp: Date.now(),
              data: { routes: routeData, stops: stopData },
            }),
          );
          setStatus("SUCCESS");
        } else {
          console.warn("⚠️ No Metro lines found (Count = 0).");
          setStatus("EMPTY");
        }

        setRoutes(routeData);
        setStops(stopData);
      } catch (error) {
        console.error("API Error:", error);
        setStatus("ERROR");
      }
    };

    loadData();
  }, [bbox]);

  return { routes, stops, status };
}
