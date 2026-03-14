"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/app-store";

interface PropertyPolygonProps {
  map: google.maps.Map;
}

export function PropertyPolygon({ map }: PropertyPolygonProps) {
  const { polygon, geocoding, matricula } = useAppStore();
  const dataLayerRef = useRef<google.maps.Data | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Clean up previous layer
    if (dataLayerRef.current) {
      dataLayerRef.current.forEach((feature) => {
        dataLayerRef.current!.remove(feature);
      });
      dataLayerRef.current.setMap(null);
    }

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    if (!geocoding && !polygon) return;

    // If we have a polygon, render it via Data Layer
    if (polygon && polygon.geometry.coordinates[0].length > 0) {
      const dataLayer = new google.maps.Data();
      dataLayer.addGeoJson({
        type: "FeatureCollection",
        features: [polygon],
      });

      dataLayer.setStyle({
        fillColor: polygon.properties.confidence === "high" ? "#1d4ed8" : "#f59e0b",
        fillOpacity: 0.25,
        strokeColor: polygon.properties.confidence === "high" ? "#1d4ed8" : "#f59e0b",
        strokeWeight: 2,
      });

      // Info window on click
      const infoWindow = new google.maps.InfoWindow();
      dataLayer.addListener("click", (event: google.maps.Data.MouseEvent) => {
        const name = matricula
          ? `Matrícula ${matricula.registro.numeroMatricula}`
          : "Imóvel";
        const source =
          polygon.properties.source === "document_coordinates"
            ? "Coordenadas do documento"
            : "Calculado a partir das dimensões (aproximado)";

        infoWindow.setContent(`
          <div style="font-family:sans-serif;font-size:13px;max-width:250px;">
            <strong>${name}</strong>
            <p style="margin:4px 0 0;color:#666;font-size:11px;">${source}</p>
          </div>
        `);
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map);
      });

      dataLayer.setMap(map);
      dataLayerRef.current = dataLayer;

      // Fit bounds to polygon
      const bounds = new google.maps.LatLngBounds();
      polygon.geometry.coordinates[0].forEach(([lng, lat]) => {
        bounds.extend({ lat, lng });
      });
      map.fitBounds(bounds, 50);
    } else if (geocoding) {
      // Marker legado (não requer mapId)
      const marker = new google.maps.Marker({
        map,
        position: { lat: geocoding.lat, lng: geocoding.lng },
        title: matricula
          ? `Matrícula ${matricula.registro.numeroMatricula}`
          : "Localização",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#1d4ed8",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });

      markerRef.current = marker;
    }

    return () => {
      if (dataLayerRef.current) {
        dataLayerRef.current.setMap(null);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [polygon, geocoding, matricula, map]);

  return null;
}
