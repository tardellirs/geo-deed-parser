import { create } from "zustand";
import type { MatriculaData } from "@/lib/types/matricula";
import type { AppState, ProgressEvent } from "@/lib/types/processing";
import type { GeoJSONPolygon, GeocodingResult } from "@/lib/types/geo";

interface AppStore {
  // App state
  appState: AppState;
  setAppState: (state: AppState) => void;

  // Processing
  progress: ProgressEvent | null;
  setProgress: (progress: ProgressEvent | null) => void;

  // Matricula data
  matricula: MatriculaData | null;
  setMatricula: (data: MatriculaData | null) => void;

  // Geo data
  geocoding: GeocodingResult | null;
  setGeocoding: (result: GeocodingResult | null) => void;
  polygon: GeoJSONPolygon | null;
  setPolygon: (polygon: GeoJSONPolygon | null) => void;

  // Error
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;

  // Geocoding error (non-fatal, shown as warning)
  geocodingError: string | null;
  setGeocodingError: (message: string | null) => void;

  // Reset
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  appState: "idle",
  setAppState: (appState) => set({ appState }),

  progress: null,
  setProgress: (progress) => set({ progress }),

  matricula: null,
  setMatricula: (matricula) => set({ matricula }),

  geocoding: null,
  setGeocoding: (geocoding) => set({ geocoding }),

  polygon: null,
  setPolygon: (polygon) => set({ polygon }),

  errorMessage: null,
  setErrorMessage: (errorMessage) => set({ errorMessage }),

  geocodingError: null,
  setGeocodingError: (geocodingError) => set({ geocodingError }),

  reset: () =>
    set({
      appState: "idle",
      progress: null,
      matricula: null,
      geocoding: null,
      polygon: null,
      errorMessage: null,
      geocodingError: null,
    }),
}));
