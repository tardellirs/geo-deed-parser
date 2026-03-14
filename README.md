# Geo Deed Parser

AI-powered web application that extracts structured data from Brazilian property registration documents (*Matrículas de Imóveis*) and plots properties on an interactive map.

Built for **M2G2 Patrimonial** to automate the manual, time-consuming process of reading scanned cartório PDFs and georeferencing real estate assets.

---

## Features

- **Multimodal AI extraction** — sends the PDF directly to Google Gemini 2.5 Flash as inline image data; no traditional OCR pipeline required
- **Chronological annotation parsing** — correctly interprets averbações in order, with later entries overriding earlier ones
- **Comprehensive data extraction** — 11+ structured fields: address, land dimensions, built area history, fiscal data, encumbrances (ônus), registration status, and document coordinates
- **Real-time progress feedback** — Server-Sent Events (SSE) stream showing each processing step as it happens
- **Interactive map** — property polygon drawn on Google Maps via the Data Layer; falls back to a marker if coordinates are unavailable
- **Polygon computation fallback** — when the document has no explicit coordinates, a rectangle is computed from the land dimensions (testada, fundos, laterais) around the geocoded center point
- **KML export** — download a `.kml` file with polygon/point, visual styles, and an HTML description balloon compatible with Google Earth Pro
- **Graceful degradation** — always shows whatever was successfully extracted, flagging uncertain fields via AI confidence notes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | shadcn/ui + Tailwind CSS 4 |
| AI | Google Gemini API (`gemini-2.5-flash`) via `@google/genai` |
| Validation | Zod v4 |
| Maps | Google Maps JavaScript API via `@googlemaps/js-api-loader` |
| State | Zustand |
| Upload | react-dropzone |
| Icons | Lucide React |

---

## Requirements

### Runtime

- **Node.js** 18.17 or later
- **npm** 9 or later (or pnpm / yarn)

### Google Cloud APIs

You need three services enabled in your Google Cloud project:

| Service | Used for | Restriction |
|---------|---------|-------------|
| Gemini API | PDF parsing (server-side) | API key restricted by IP |
| Maps JavaScript API | Interactive map (client-side) | API key restricted by HTTP referrer |
| Geocoding API | Address → coordinates (server-side) | API key restricted by IP |

### API Keys

Create a `.env.local` file at the project root with:

```env
# Server-side key — enable Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Client-side key — enable Maps JavaScript API
# Restrict this key to your domain in Google Cloud Console
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_js_api_key_here

# Server-side key — enable Geocoding API
# Can be the same key as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY during development
GOOGLE_MAPS_SERVER_KEY=your_geocoding_api_key_here
```

> **Note:** During local development you can use the same API key for all three variables, provided both the Maps JavaScript API and Geocoding API are enabled for that key.

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/m2g2patrimonial/geo-deed-parser.git
cd geo-deed-parser

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Upload** — drag and drop a *Matrícula de Imóvel* PDF (or click to browse). Maximum file size: 50 MB.
2. **Processing** — watch the real-time progress bar as the AI reads the document page by page.
3. **Review results** — the left panel shows all extracted fields: address, dimensions, areas, fiscal data, encumbrances, and AI confidence notes.
4. **Explore the map** — the right panel shows the property polygon (or marker) on Google Maps. Blue = high confidence; amber = approximate.
5. **Export KML** — click *Exportar KML* to download a `.kml` file. Open it in Google Earth Pro to see the polygon with a rich description balloon.
6. **Reset** — click *Nova Matrícula* to clear all state and process another document.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Main SPA — orchestrates all hooks and state
│   ├── globals.css
│   └── api/
│       ├── parse/route.ts        # POST: PDF → SSE stream → MatriculaData
│       ├── geocode/route.ts      # POST: address string → lat/lng
│       └── export/kml/route.ts  # POST: data → .kml file download
│
├── lib/
│   ├── gemini/
│   │   ├── client.ts             # GoogleGenAI singleton + model constant
│   │   ├── prompt.ts             # System instruction, user prompt, JSON schema
│   │   └── parser.ts             # Orchestrator: base64 → Gemini → Zod validation
│   ├── geo/
│   │   ├── geocoder.ts           # Google Geocoding API wrapper
│   │   ├── polygon.ts            # Polygon from coordinates or from dimensions
│   │   └── kml-builder.ts        # KML XML string builder
│   ├── types/
│   │   ├── matricula.ts          # MatriculaData — central data model
│   │   ├── processing.ts         # ProgressEvent, AppState
│   │   └── geo.ts                # GeoJSONPolygon, GeocodingResult
│   └── validation/
│       └── matricula-schema.ts   # Zod schema for runtime AI output validation
│
├── components/
│   ├── layout/                   # Header, MainLayout (split-pane)
│   ├── upload/                   # Dropzone, ProcessingStatus
│   ├── results/                  # ResultsPanel and all sub-sections
│   └── map/                      # MapContainer, PropertyPolygon, MapControls
│
├── hooks/
│   ├── use-pdf-parser.ts         # Upload + SSE stream consumer
│   ├── use-google-maps.ts        # Maps JS API loader
│   └── use-polygon.ts            # Polygon computation trigger
│
└── stores/
    └── app-store.ts              # Zustand: all global application state
```

---

## API Reference

### `POST /api/parse`

Extracts structured data from a property registration PDF.

**Request:** `multipart/form-data` with a `file` field (PDF, max 50 MB)

**Response:** `text/event-stream` (SSE)

| Event | Payload |
|-------|---------|
| `progress` | `{ step: string, message: string, percent: number }` |
| `complete` | `{ success: true, data: MatriculaData }` |
| `error` | `{ success: false, error: { code: string, message: string } }` |

---

### `POST /api/geocode`

Geocodes a Brazilian property address.

**Request:** `{ "address": "Rua das Flores, 123, Brasília, DF" }`

**Response:** `{ "lat": -15.78, "lng": -47.93, "formattedAddress": "...", "confidence": "high" | "medium" | "low" }`

---

### `POST /api/export/kml`

Generates a KML file for a processed property.

**Request:** `{ "matricula": MatriculaData, "polygon": GeoJSONPolygon | null, "center": { "lat": number, "lng": number } | null }`

**Response:** `application/vnd.google-earth.kml+xml` with `Content-Disposition: attachment; filename="matricula-XXXXX.kml"`

---

## Core Data Model

```typescript
interface MatriculaData {
  meta:      { extractedAt, modelUsed, documentPages, processingTimeMs };
  registro:  { numeroMatricula, cartorio: { numero, nome, cidade, estado } };
  endereco:  { logradouro, numero, complemento, bairro, cidade, estado, cep,
               lote, quadra, loteamento, enderecoCompleto };
  dimensoes: { testada, fundos, lateralDireita, lateralEsquerda,
               descricaoFormaIrregular };
  areas:     { terreno, privativa, comum, totalCondominio,
               construida: { bruta, demolicoes, liquida, historicoAlteracoes },
               app };
  fiscal:    { inscricaoCadastral, iptu };
  status:    { ativa, encerrada, motivoEncerramento, alertaEncerramento };
  onus:      Array<{ tipo, descricao, dataRegistro, dataCancelamento,
                     ativo, valor, beneficiario }>;
  coordenadas: Array<{ lat, lng, label }> | null;
  aiNotes:   { confidence: "high" | "medium" | "low",
               uncertainFields: string[], notes: string[] };
}
```

---

## Limitations

- **PDF quality** — heavily degraded scans or handwritten documents may produce incomplete or low-confidence extractions. The AI will flag uncertain fields in `aiNotes`.
- **Polygon accuracy** — polygons computed from dimensions (when no explicit coordinates exist in the document) are approximate rectangles aligned with cardinal directions. They are labeled `confidence: "low"` and shown in amber on the map.
- **UTM coordinates** — the AI is instructed to convert UTM to WGS84, but accuracy depends on the Gemini model's current capabilities.
- **Geocoding** — if the property address cannot be geocodified by Google (e.g. rural lots without a street address), no polygon is drawn. A warning is shown in the results panel.
- **File size** — maximum 50 MB per PDF. Multi-document transactions should be split and processed individually.
- **Rate limits** — the Gemini API free tier has per-minute request limits. Large batches may require adding retry/backoff logic or upgrading to a paid quota.

---

## License

Proprietary — M2G2 Patrimonial. All rights reserved.
