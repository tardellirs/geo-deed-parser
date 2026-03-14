export interface GeoJSONPolygon {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
  properties: {
    matricula: string;
    source: "document_coordinates" | "computed_from_dimensions" | "manual";
    confidence: "high" | "medium" | "low";
  };
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  confidence: "high" | "medium" | "low";
}

export interface KmlExportOptions {
  includeDescription: boolean;
  polygonColor: string;
  polygonOpacity: number;
  lineColor: string;
  lineWidth: number;
}
