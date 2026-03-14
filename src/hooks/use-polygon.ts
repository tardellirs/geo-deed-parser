"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import {
  computePolygonFromCoordinates,
  computePolygonFromDimensions,
} from "@/lib/geo/polygon";

export function usePolygon() {
  const { matricula, geocoding, setPolygon } = useAppStore();

  useEffect(() => {
    if (!matricula) {
      setPolygon(null);
      return;
    }

    const num = matricula.registro.numeroMatricula;

    // Priority 1: Use coordinates from the document
    if (matricula.coordenadas && matricula.coordenadas.length >= 3) {
      const polygon = computePolygonFromCoordinates(matricula.coordenadas, num);
      setPolygon(polygon);
      return;
    }

    // Priority 2: Compute from dimensions + geocoded center
    if (geocoding && matricula.dimensoes) {
      const polygon = computePolygonFromDimensions(
        { lat: geocoding.lat, lng: geocoding.lng },
        matricula.dimensoes,
        num
      );
      setPolygon(polygon);
      return;
    }

    // No polygon possible
    setPolygon(null);
  }, [matricula, geocoding, setPolygon]);
}
