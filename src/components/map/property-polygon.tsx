"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/app-store";

interface PropertyPolygonProps {
  map: google.maps.Map;
}

export function PropertyPolygon({ map }: PropertyPolygonProps) {
  const { geocoding, matricula } = useAppStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    if (!geocoding) return;

    const marker = new google.maps.Marker({
      map,
      position: { lat: geocoding.lat, lng: geocoding.lng },
      title: matricula
        ? `Matrícula ${matricula.registro.numeroMatricula}`
        : "Localização",
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
            <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#dc2626"/>
            <circle cx="14" cy="14" r="6" fill="white"/>
          </svg>`
        )}`,
        scaledSize: new google.maps.Size(28, 40),
        anchor: new google.maps.Point(14, 40),
      },
    });

    markerRef.current = marker;

    return () => {
      marker.setMap(null);
    };
  }, [geocoding, matricula, map]);

  return null;
}
