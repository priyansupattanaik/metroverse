import { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_TRANSITLAND_KEY;
// Cache for 3 days to save API calls
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 3;

export function useTransitData(bbox: string) {
  const [routes, setRoutes] = useState<any>(null);
  const [stops, setStops] = useState<any>(null);
  const [status, setStatus] = useState<string>("IDLE");

  useEffect(() => {
    if (!bbox || !API_KEY) {
      console.warn("Missing BBOX or API KEY");
      return;
    }

    const loadData = async () => {
      setStatus("LOADING");

      // 1. CHECK LOCAL STORAGE CACHE
      const cacheKey = `metro_bbox_v6_${bbox}`;
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
        console.warn("Cache read error");
      }

      // 2. FETCH LIVE DATA
      try {
        console.log(`🌐 Scanning Area: ${bbox}`);

        const [routesRes, stopsRes] = await Promise.all([
          // Fetch Routes: Look for 'metro' vehicle types in the box
          axios.get("https://transit.land/api/v2/rest/routes", {
            params: {
              bbox: bbox,
              vehicle_type: "metro",
              include_geometry: true,
              limit: 200, // High limit to ensure we get everything
            },
            headers: { apikey: API_KEY },
          }),
          // Fetch Stops: Look for 'metro' stops in the box
          axios.get("https://transit.land/api/v2/rest/stops", {
            params: {
              bbox: bbox,
              vehicle_type: "metro",
              limit: 2000, // Huge limit so we don't miss dots
            },
            headers: { apikey: API_KEY },
          }),
        ]);

        // Process Routes
        const routeFeatures = routesRes.data.routes.map((route: any) => ({
          type: "Feature",
          geometry: route.geometry,
          properties: {
            name: route.route_long_name || route.route_short_name,
            // Fallback color to Cyan if API sends null
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

        // Save to Cache
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
