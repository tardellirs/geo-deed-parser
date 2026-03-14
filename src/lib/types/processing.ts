import type { MatriculaData } from "./matricula";

export type ProcessingStep =
  | "uploading"
  | "analyzing"
  | "reading_averbacoes"
  | "extracting_dimensions"
  | "extracting_coordinates"
  | "extracting_onus"
  | "validating"
  | "complete"
  | "error";

export interface ProgressEvent {
  step: ProcessingStep;
  message: string;
  percent: number;
}

export interface ParseResult {
  success: boolean;
  data?: MatriculaData;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export type AppState = "idle" | "processing" | "complete" | "error";
