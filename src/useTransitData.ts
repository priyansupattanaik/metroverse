import { useState, useEffect } from "react";
import axios from "axios";

// Get key from .env
const API_KEY = import.meta.env.VITE_TRANSITLAND_KEY;

export function useTransitData(operatorId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!operatorId || !API_KEY) {
      console.warn(
        "Skipping Transitland fetch: Missing Operator ID or API Key",
      );
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching Metro Data for ${operatorId}...`);

        // Fetch top 50 routes for this operator (e.g., DMRC)
        const response = await axios.get(
          "https://transit.land/api/v2/rest/routes",
          {
            params: {
              operator_onestop_id: operatorId,
              include_geometry: true,
              limit: 50,
            },
            headers: { apikey: API_KEY },
          },
        );

        const features = response.data.routes.map((route: any) => {
          // Default to Cyan if no color provided
          const color = route.route_color ? `#${route.route_color}` : "#00FFFF";

          return {
            type: "Feature",
            geometry: route.geometry,
            properties: {
              name: route.route_long_name || route.route_short_name,
              color: color,
            },
          };
        });

        setData({ type: "FeatureCollection", features });
      } catch (error) {
        console.error("Transitland API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [operatorId]);

  return { data, loading };
}
