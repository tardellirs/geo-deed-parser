export class GeoParserError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = "GeoParserError";
  }
}

export class FileValidationError extends GeoParserError {
  constructor(message: string, details?: string) {
    super("FILE_VALIDATION_ERROR", message, details);
    this.name = "FileValidationError";
  }
}

export class GeminiApiError extends GeoParserError {
  constructor(message: string, details?: string) {
    super("GEMINI_API_ERROR", message, details);
    this.name = "GeminiApiError";
  }
}

export class ExtractionError extends GeoParserError {
  constructor(message: string, details?: string) {
    super("EXTRACTION_ERROR", message, details);
    this.name = "ExtractionError";
  }
}

export class GeocodingError extends GeoParserError {
  constructor(message: string, details?: string) {
    super("GEOCODING_ERROR", message, details);
    this.name = "GeocodingError";
  }
}

export class PolygonError extends GeoParserError {
  constructor(message: string, details?: string) {
    super("POLYGON_ERROR", message, details);
    this.name = "PolygonError";
  }
}
