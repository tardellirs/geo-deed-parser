"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let optionsSet = false;

export function useGoogleMaps(mapRef: React.RefObject<HTMLDivElement | null>) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || !mapRef.current) return;
    initRef.current = true;

    if (!optionsSet) {
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        v: "weekly",
      });
      optionsSet = true;
    }

    importLibrary("maps").then(() => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: -15.7801, lng: -47.9292 },
        zoom: 4,
        mapTypeId: "roadmap",
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(mapInstance);
      setIsLoaded(true);
    });
  }, [mapRef]);

  return { map, isLoaded };
}
