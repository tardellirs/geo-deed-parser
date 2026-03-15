# 📄 Geo Deed Parser

Geo Deed Parser is an AI-powered spatial intelligence tool that transforms unstructured Brazilian property deeds into interactive maps and structured data.

Eliminate the manual review of degraded registry PDFs. By leveraging Google Gemini's multimodal engine, the system chronologically parses historical records, calculates built areas, and flags legal encumbrances. It automatically computes property polygons and georeferences assets on Google Maps, delivering instant KML exports for advanced topographic analysis in Google Earth.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2?logo=google&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4-3E67B1?logo=zod&logoColor=white)
![Google Maps](https://img.shields.io/badge/Google%20Maps-JS%20API-4285F4?logo=googlemaps&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

🖥️ Running on Oracle Ampere (ARM64) | Cloudflare SSL | Automatic deploy via GitHub Actions

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

## Docker & Deployment

### Running with Docker (local)

```bash
# Build and start
docker compose up -d --build

# Stop
docker compose down
```

> `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is baked into the client bundle at build time.
> `GOOGLE_GEMINI_API_KEY` and `GOOGLE_MAPS_SERVER_KEY` are injected at runtime via environment variables.

---

### Production — CI/CD via GitHub Actions

Every push to `main` triggers the pipeline automatically:

1. **Build** — GitHub Actions builds a multi-arch Docker image (`linux/amd64` + `linux/arm64`)
2. **Push** — image is published to GitHub Container Registry (`ghcr.io`)
3. **Deploy** — pipeline SSHs into the production server, pulls the new image and restarts the container

```
git push origin main
  → Build (~5 min, multi-arch QEMU emulation)
  → Push to ghcr.io/tardellirs/geo-deed-parser:latest
  → SSH → docker compose pull + docker compose up -d
```

#### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Production server IP |
| `SERVER_USER` | SSH user (e.g. `ubuntu`) |
| `SERVER_SSH_KEY` | Private SSH key authorized on the server |
| `CR_PAT` | GitHub classic token with `read:packages` scope (for server to pull from GHCR) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JS API key (baked into the image at build time) |

#### Production server setup (one-time)

```bash
# Create shared Docker network
docker network create web

# Connect nginx to the shared network
docker network connect web isocronas-nginx

# Create deployment directory with environment file
mkdir -p /opt/geo-deed-parser
cat > /opt/geo-deed-parser/.env << EOF
GOOGLE_GEMINI_API_KEY=your_key
GOOGLE_MAPS_SERVER_KEY=your_key
EOF

# Copy the production docker-compose.yml
cp docker-compose.yml /opt/geo-deed-parser/docker-compose.yml

# Authenticate with GHCR
echo "YOUR_CR_PAT" | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
```

---

## License

MIT License — free to use, modify, and distribute.
