import type { Dimensoes, Coordenada } from "@/lib/types/matricula";
import type { GeoJSONPolygon } from "@/lib/types/geo";

const METERS_PER_DEGREE_LAT = 111320;

function metersToDegreesLat(meters: number): number {
  return meters / METERS_PER_DEGREE_LAT;
}

function metersToDegreesLng(meters: number, latRadians: number): number {
  return meters / (METERS_PER_DEGREE_LAT * Math.cos(latRadians));
}

function rotatePoint(
  x: number,
  y: number,
  angleRad: number
): [number, number] {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return [x * cos - y * sin, x * sin + y * cos];
}

export function computePolygonFromCoordinates(
  coordenadas: Coordenada[],
  matriculaNum: string
): GeoJSONPolygon {
  const coords: [number, number][] = coordenadas.map((c) => [c.lng, c.lat]);
  // Close the ring if not already closed
  if (
    coords.length > 0 &&
    (coords[0][0] !== coords[coords.length - 1][0] ||
      coords[0][1] !== coords[coords.length - 1][1])
  ) {
    coords.push([...coords[0]]);
  }

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
    properties: {
      matricula: matriculaNum,
      source: "document_coordinates",
      confidence: "high",
    },
  };
}

export function computePolygonFromDimensions(
  center: { lat: number; lng: number },
  dimensoes: Dimensoes,
  matriculaNum: string,
  bearingDegrees: number = 0
): GeoJSONPolygon | null {
  const testada = dimensoes.testada?.metros;
  const fundos = dimensoes.fundos?.metros ?? testada;
  const lateralDir = dimensoes.lateralDireita?.metros;
  const lateralEsq = dimensoes.lateralEsquerda?.metros;

  // Need at least testada and one lateral
  if (!testada || (!lateralDir && !lateralEsq)) {
    return null;
  }

  const lateral = lateralDir ?? lateralEsq!;
  const lateralR = lateralDir ?? lateral;
  const lateralL = lateralEsq ?? lateral;
  const back = fundos ?? testada;

  const latRad = (center.lat * Math.PI) / 180;
  const bearingRad = (bearingDegrees * Math.PI) / 180;

  // Compute half-dimensions in degrees
  const halfTestada = metersToDegreesLng(testada / 2, latRad);
  const halfBack = metersToDegreesLng(back / 2, latRad);
  const halfLateralL = metersToDegreesLat(lateralL / 2);
  const halfLateralR = metersToDegreesLat(lateralR / 2);

  // Vertices relative to center (x = lng offset, y = lat offset)
  // Front-left, Front-right, Back-right, Back-left
  const vertices: [number, number][] = [
    [-halfTestada, -halfLateralL], // front-left
    [halfTestada, -halfLateralR],  // front-right
    [halfBack, halfLateralR],      // back-right
    [-halfBack, halfLateralL],     // back-left
  ];

  // Apply rotation and convert to absolute coordinates
  const absoluteCoords: [number, number][] = vertices.map(([x, y]) => {
    const [rx, ry] = rotatePoint(x, y, bearingRad);
    return [center.lng + rx, center.lat + ry];
  });

  // Close the ring
  absoluteCoords.push([...absoluteCoords[0]]);

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [absoluteCoords],
    },
    properties: {
      matricula: matriculaNum,
      source: "computed_from_dimensions",
      confidence: "low",
    },
  };
}
