"use client";

import { useRef, useEffect } from "react";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { useAppStore } from "@/stores/app-store";
import { PropertyPolygon } from "./property-polygon";
import { Map as MapIcon } from "lucide-react";

export function MapContainer() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded } = useGoogleMaps(mapRef);
  const { geocoding, appState } = useAppStore();

  // Center map on geocoded location
  useEffect(() => {
    if (!map || !geocoding) return;
    map.setCenter({ lat: geocoding.lat, lng: geocoding.lng });
    map.setZoom(17);
  }, [map, geocoding]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MapIcon className="h-8 w-8" />
            <p className="text-sm">Carregando mapa...</p>
          </div>
        </div>
      )}

      {isLoaded && appState === "idle" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Envie uma matrícula para visualizar o imóvel no mapa
            </p>
          </div>
        </div>
      )}

      {isLoaded && map && <PropertyPolygon map={map} />}
    </div>
  );
}
