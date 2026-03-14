# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the Next.js dev server on `http://localhost:3000` |
| `npm run build` | Build for production (validates TypeScript and Next.js) |
| `npm run lint` | Run ESLint on all files (ESLint 9 + Next.js config) |
| `npm start` | Start the production server (after `npm run build`) |

---

## Architecture Overview

This is a **single-page web application** (SPA) that processes Brazilian property registration PDFs end-to-end:

```
PDF Upload → AI Extraction (SSE) → Zod Validation → Zustand Store →
  Results Panel (left) + Map (right) → KML Export
```

### Data Flow

1. **Upload Phase** (`app/page.tsx`)
   - User drops PDF on `<Dropzone>`
   - File validated client-side (PDF, < 50 MB)
   - Sent to `POST /api/parse` as multipart/form-data

2. **Extraction Phase** (`api/parse/route.ts`)
   - File converted to base64
   - Sent to Google Gemini 2.5 Flash with inline PDF data
   - SSE stream emits `progress` → `complete` or `error` events
   - Zod validation on Gemini response

3. **Storage Phase** (`hooks/use-pdf-parser.ts` + Zustand)
   - SSE stream consumed, parsed line-by-line
   - `MatriculaData` stored in `useAppStore()` (Zustand)
   - `appState` transitions: `idle` → `processing` → `complete` | `error`

4. **Enrichment Phase** (`page.tsx` useEffect)
   - Address from extracted data geocoded via `POST /api/geocode`
   - Lat/lng stored in store as `geocoding`
   - Polygon computed in `use-polygon.ts` hook (priorities: document coords → computed from dimensions → null)

5. **Display Phase**
   - `<ResultsPanel>` renders all extracted fields (left panel)
   - `<MapContainer>` with `<PropertyPolygon>` renders polygon/marker (right panel)
   - User can export as KML via `POST /api/export/kml`

### State Management (Zustand)

**File:** `src/stores/app-store.ts`

Key state atoms:
- `appState: "idle" | "processing" | "complete" | "error"` — UI phase
- `matricula: MatriculaData | null` — extracted property data
- `progress: ProgressEvent | null` — current SSE progress (step, message, percent)
- `geocoding: GeocodingResult | null` — lat/lng + formatted address
- `polygon: GeoJSONPolygon | null` — computed or document-sourced polygon
- `errorMessage: string | null` — fatal error (shows error state)
- `geocodingError: string | null` — non-fatal geocoding error (shows as yellow warning in results panel)

---

## Core Modules

### `src/lib/types/`

**`matricula.ts`** — Central `MatriculaData` interface. Every module depends on this. Structure:
- `meta` — extraction metadata (timestamp, model, processing time)
- `registro` — registration number and cartório info
- `endereco` — property address (not cartório address; see Gemini prompt rule 2)
- `dimensoes` — land measurements (testada, fundos, laterais)
- `areas` — terreno, built area with history, condominium, APP
- `fiscal` — IPTU and cadastral registration
- `status` — active/closed; closure reason
- `onus` — all encumbrances (liens, mortgages, etc.) with cancellation tracking
- `coordenadas` — explicit WGS84 coordinates from document (if present)
- `aiNotes` — confidence level and uncertainty flags

**`processing.ts`** — Event types for SSE streaming (`ProgressEvent`, `AppState`, `ParseResult`)

**`geo.ts`** — `GeoJSONPolygon` (with `confidence`, `source`, `properties`) and `GeocodingResult`

### `src/lib/gemini/`

**`client.ts`** — Singleton Google Generative AI client; exports `GEMINI_MODEL = "gemini-2.5-flash"`

**`prompt.ts`** — System instruction (9 critical rules in Portuguese for chronological reading, address disambiguation, area calculation, etc.) and `getResponseSchema()` (hand-crafted JSON schema, no `zod-to-json-schema` dependency due to Zod v4 incompatibility). Key rule: **later averbações override earlier ones**.

**`parser.ts`** — `parseMatricula(file, onProgress)` orchestrator:
- Converts file to base64
- Calls `client.models.generateContent()` with inline PDF
- Streams via `onProgress` callback
- Validates response with Zod
- Returns `MatriculaData` with `meta` fields

### `src/lib/geo/`

**`geocoder.ts`** — `geocodeAddress(address)` wrapper around Google Geocoding API. Appends ", Brasil", maps location_type to confidence.

**`polygon.ts`** — Two strategies:
- `computePolygonFromCoordinates()` — direct from document WGS84/UTM coords → `confidence: "high"`
- `computePolygonFromDimensions()` — converts testada/fundos/laterais (meters) to degrees, builds 4-vertex rectangle around geocoded center, applies bearing rotation → `confidence: "low"`

**`kml-builder.ts`** — `buildKml()` generates KML XML via template literals. Returns `<Polygon>` (if polygon) or `<Point>` (if marker only). Description balloon is HTML with property data table + ônus warnings.

### `src/lib/validation/`

**`matricula-schema.ts`** — Full Zod v4 schema mirroring TypeScript interfaces. Used for Gemini response validation and runtime type-checking.

### `src/hooks/`

**`use-pdf-parser.ts`** — File upload + SSE stream consumer. Parses `event: progress`, `event: complete`, `event: error` lines manually. Dispatches to Zustand store.

**`use-google-maps.ts`** — Uses `@googlemaps/js-api-loader` v2 functional API (`setOptions`, `importLibrary`). Initializes map centered on Brazil. Note: `mapId` removed (was breaking `AdvancedMarkerElement`); uses legacy `google.maps.Marker` instead.

**`use-polygon.ts`** — Watches `matricula` and `geocoding` changes, triggers polygon computation via `usePolygon()` hook.

### `src/components/`

**Layout:** `Header` (logo + title), `MainLayout` (split-pane 40/60 split)

**Upload:** `Dropzone` (react-dropzone), `ProcessingStatus` (progress bar + message)

**Results:** `ResultsPanel` + sub-components for each section (address, dimensions, areas, fiscal, etc.). Yellow warning banner for `geocodingError`.

**Map:** `MapContainer` (wraps Google Maps), `PropertyPolygon` (Data Layer for GeoJSON or legacy Marker), `MapControls`

---

## API Routes

### `POST /api/parse`

**Input:** multipart/form-data (file: PDF)
**Output:** text/event-stream

Uses `export const dynamic = "force-dynamic"` to disable caching. Streams three event types:
```
event: progress
data: {"step":"...", "message":"...", "percent":N}

event: complete
data: {"success":true, "data":{MatriculaData}}

event: error
data: {"success":false, "error":{"code":"...", "message":"..."}}
```

### `POST /api/geocode`

**Input:** `{ "address": string }`
**Output:** `{ "lat": number, "lng": number, "formattedAddress": string, "confidence": "high"|"medium"|"low" }`

Proxy to Google Geocoding API. Appends ", Brasil" to query for localization.

### `POST /api/export/kml`

**Input:** `{ "matricula": MatriculaData, "polygon": GeoJSONPolygon | null, "center": { "lat", "lng" } | null }`
**Output:** application/vnd.google-earth.kml+xml (file download)

Calls `buildKml()` from `lib/geo/kml-builder.ts`.

---

## Key Design Decisions

### 1. No Database / In-Memory Only

State is stored in Zustand (browser memory). PDFs are processed in-memory; nothing is persisted. This is intentional for the MVP.

### 2. Gemini Inline PDF (Not Files API)

PDFs are converted to base64 and sent as `inline_data` in the Gemini request body. This avoids managing file uploads via the Files API and keeps the flow simple.

### 3. Manual JSON Schema for Gemini

The `responseSchema` parameter in Gemini expects plain JSON Schema, not Zod's export. Thus, `getResponseSchema()` in `prompt.ts` is hand-crafted to match the TypeScript interface.

### 4. Chronological Processing Rule

The Gemini prompt's **rule 1** explicitly tells the model to read averbações in order and let later entries override earlier ones. This is enforced via instructions, not code logic.

### 5. Polygon Fallback Chain

Priority for polygon source:
1. Explicit coordinates from document (high confidence)
2. Computed from dimensions + geocoded center (low confidence)
3. Marker only (no polygon)

### 6. Legacy Marker, Not AdvancedMarkerElement

`AdvancedMarkerElement` requires a valid `mapId` created in Google Cloud Console. Since we don't have one, we use legacy `google.maps.Marker` with custom circle icon.

### 7. Non-Fatal Geocoding Errors

Geocoding failure doesn't block the UI; it sets `geocodingError` state and shows a yellow warning banner. Results panel is still visible.

---

## Common Tasks

### Modifying Extraction Logic

1. Edit the Gemini system instruction in `src/lib/gemini/prompt.ts` (rule comments)
2. Update the JSON schema in `getResponseSchema()` to match new fields
3. Update the TypeScript interface in `src/lib/types/matricula.ts`
4. Update the Zod schema in `src/lib/validation/matricula-schema.ts`
5. Add new component sections in `src/components/results/` to display new fields

### Adding a New API Route

1. Create `src/app/api/[name]/route.ts`
2. Export `POST` or `GET` function
3. Call from appropriate hook/component
4. Update `src/hooks/use-pdf-parser.ts` or relevant component to consume the response

### Changing Map Behavior

1. Edit `src/hooks/use-google-maps.ts` for map initialization
2. Edit `src/components/map/property-polygon.tsx` for polygon/marker rendering
3. Check `src/lib/geo/polygon.ts` if polygon computation logic changes

### Debugging SSE Stream

Use browser DevTools → Network tab → filter for `/api/parse`. Click the request and view the **Messages** tab to see each SSE event.

### Testing Gemini Extraction Locally

Run `npm run dev`, then upload a test PDF. Watch the console for:
- `use-pdf-parser.ts` SSE event logs
- `parser.ts` validation errors (Zod)
- Zustand store changes in Redux DevTools (if installed)

---

## Environment Variables

**Required in `.env.local`:**
- `GOOGLE_GEMINI_API_KEY` — server-side only; enable Gemini API
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — client-side; enable Maps JS API, restrict by HTTP referrer
- `GOOGLE_MAPS_SERVER_KEY` — server-side; enable Geocoding API, restrict by IP (can be same as above in dev)

---

## Known Limitations & Gotchas

1. **Zod v4 + `zod-to-json-schema`** — The package is incompatible. JSON schema is hand-crafted in `prompt.ts`.
2. **`mapId` not needed** — We removed it because it was silently breaking `AdvancedMarkerElement`. Legacy `google.maps.Marker` works fine.
3. **File upload is synchronous** — There's no persistent queue; each file is processed one at a time in the session.
4. **Polygon computation assumes cardinal bearing** — Rotations are not applied unless the document explicitly states a bearing angle.
5. **Browser locale** — UI is hardcoded in Portuguese (pt-BR). No i18n currently.

---

## Debugging Tips

- **SSE not streaming?** Check `export const dynamic = "force-dynamic"` in the route handler. Vercel/production caches by default.
- **Polygon not showing?** Check browser console for map errors. Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is valid.
- **Gemini response invalid?** Check `parser.ts` Zod error logs. The AI may be returning malformed JSON or missing required fields.
- **Geocoding returns null?** The address may be too vague (rural lots often don't have formal street addresses). Check `geocodingError` state.
