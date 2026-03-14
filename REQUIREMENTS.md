# Geo Deed Parser — Requirements

## 1. Business Context

**Problem:** Reading Brazilian property registration documents (*Matrículas de Imóveis*) is a slow, manual process. Analysts must read multi-page scanned PDFs, interpret chronological annotations (*averbações*), compute net built areas, identify active encumbrances, and manually plot properties on a map.
**Goal:** Automate this workflow end-to-end using multimodal AI and a web interface, reducing processing time from ~30 minutes per document to under 2 minutes.

---

## 2. Functional Requirements

### 2.1 Document Upload

| ID | Requirement |
|----|-------------|
| F-01 | The system shall accept PDF files via drag-and-drop or file browser click. |
| F-02 | The system shall validate that the uploaded file is a PDF before processing. |
| F-03 | The system shall reject files larger than 50 MB with an immediate error message. |
| F-04 | The system shall support multi-page PDFs (typical matrículas are 5–30 pages). |

### 2.2 AI Extraction

| ID | Requirement |
|----|-------------|
| F-10 | The system shall extract the property **address** (logradouro, número, complemento, bairro, cidade, estado, CEP, lote, quadra, loteamento). It shall not confuse the cartório's address with the property's address. |
| F-11 | The system shall extract **land dimensions**: testada (front), fundos (back), lateral direita (right side), lateral esquerda (left side), and a free-text description for irregular shapes. |
| F-12 | The system shall extract **land area** in square meters. |
| F-13 | The system shall extract **built area** history: each construction/demolition/renovation event with its date and area. It shall compute net built area as `Σ constructions − Σ demolitions`. |
| F-14 | The system shall extract **condominium areas** when applicable (private, common, total). |
| F-15 | The system shall extract **APP** (Área de Preservação Permanente) in square meters when present. |
| F-16 | The system shall extract **fiscal data**: inscricão cadastral and IPTU reference. |
| F-17 | The system shall extract **registration status**: whether the matrícula is active or closed, and the reason for closure. |
| F-18 | The system shall extract **all active encumbrances** (*ônus*): type, description, registration date, cancellation date, beneficiary, and value. An encumbrance cancelled in a later averbação shall not be reported as active. |
| F-19 | The system shall extract **explicit geographic coordinates** (WGS84 or UTM converted to WGS84) when present in the document, in perimeter order. |
| F-20 | The system shall read the document **chronologically**. Data from later averbações shall override data from earlier ones for the same field. |
| F-21 | The system shall report an **AI confidence level** (high / medium / low) and list fields with uncertainty or ambiguity. |

### 2.3 Real-Time Feedback

| ID | Requirement |
|----|-------------|
| F-30 | The system shall stream processing progress to the browser via Server-Sent Events (SSE). |
| F-31 | Progress events shall include a step name, human-readable message, and percentage (0–100). |
| F-32 | A completion event shall carry the full `MatriculaData` JSON payload. |
| F-33 | An error event shall carry a machine-readable error code and a user-facing message. |

### 2.4 Results Display

| ID | Requirement |
|----|-------------|
| F-40 | The system shall display extracted data in a structured panel with labeled sections. |
| F-41 | The system shall display a prominent warning banner listing all **active encumbrances** (ônus ativos). |
| F-42 | The system shall display a warning if the matrícula is **closed** (encerrada). |
| F-43 | The system shall display AI confidence notes for uncertain fields. |
| F-44 | If geocoding fails, the system shall display a non-fatal yellow warning with a descriptive message instead of silently disabling map features. |

### 2.5 Map

| ID | Requirement |
|----|-------------|
| F-50 | The system shall geocode the extracted property address via the Google Geocoding API. |
| F-51 | If the document contains explicit coordinates, the system shall render a polygon on the map using those coordinates (`confidence: "high"`). |
| F-52 | If no explicit coordinates exist but land dimensions are available, the system shall compute an approximate polygon from the dimensions and geocoded center point (`confidence: "low"`). |
| F-53 | If neither coordinates nor sufficient dimensions are available, the system shall render a point marker at the geocoded location. |
| F-54 | High-confidence polygons shall be displayed in blue; low-confidence polygons in amber. |
| F-55 | Clicking on the polygon shall open an info window with the property registration number and coordinate source. |
| F-56 | The map shall automatically fit its bounds to the polygon/marker after rendering. |

### 2.6 KML Export

| ID | Requirement |
|----|-------------|
| F-60 | The system shall generate a downloadable `.kml` file containing the property polygon or point. |
| F-61 | The KML file shall include a styled polygon with semi-transparent fill and border. |
| F-62 | The KML balloon description shall contain an HTML table with all key extracted fields (address, areas, fiscal data) and list active encumbrances. |
| F-63 | The generated KML shall be compatible with Google Earth Pro. |
| F-64 | The KML export button shall be disabled when no location data is available, with a tooltip explaining why. |

### 2.7 Session Management

| ID | Requirement |
|----|-------------|
| F-70 | The system shall provide a "Nova Matrícula" (New Property) action that resets all state to the initial upload screen. |
| F-71 | The system shall provide a "Copiar Dados" (Copy Data) action that copies extracted fields to the clipboard in a readable format. |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement |
|----|-------------|
| NF-01 | The AI extraction for a typical 10-page matrícula shall complete in under 60 seconds. |
| NF-02 | SSE progress events shall be emitted within 1 second of each processing milestone. |
| NF-03 | The map shall render the polygon within 2 seconds of receiving geocoding results. |

### 3.2 Reliability

| ID | Requirement |
|----|-------------|
| NF-10 | The system shall retry Gemini API calls up to 3 times with exponential backoff on rate limit (429) errors. |
| NF-11 | Partial extraction results shall always be shown to the user, even if some fields could not be parsed. |
| NF-12 | Geocoding failures shall be non-fatal: the results panel shall still display extracted data. |

### 3.3 Security

| ID | Requirement |
|----|-------------|
| NF-20 | The Gemini API key shall never be exposed to the client; all AI calls shall be made server-side. |
| NF-21 | The Google Geocoding API key shall be server-side only (not `NEXT_PUBLIC_*`). |
| NF-22 | The client-facing Maps JavaScript API key shall be restricted by HTTP referrer in Google Cloud Console for production deployments. |
| NF-23 | Uploaded PDF files shall be processed in-memory and not persisted to disk or any storage service. |

### 3.4 Usability

| ID | Requirement |
|----|-------------|
| NF-30 | The interface shall be in Brazilian Portuguese. |
| NF-31 | The application shall function correctly on modern desktop browsers (Chrome, Firefox, Edge, Safari — latest 2 versions). |
| NF-32 | The split-pane layout shall allocate approximately 40% of viewport width to the data panel and 60% to the map. |

---

## 4. Technical Constraints

| Constraint | Description |
|-----------|-------------|
| AI Model | Google Gemini `gemini-2.5-flash` (multimodal, inline PDF support, structured JSON output) |
| Maps | Google Maps JavaScript API — Data Layer for GeoJSON polygons; legacy `google.maps.Marker` (no `mapId` required) |
| Streaming | Next.js App Router `ReadableStream` + `TextEncoder` for SSE; no WebSocket dependency |
| Validation | Zod v4 — schema must be compatible with both runtime validation and Gemini `responseSchema` format |
| No persistence | No database; all state is in-memory (Zustand) per browser session |
| No authentication | Single-tenant tool; no user login required in the initial version |

---

## 5. Out of Scope (v1)

- Batch processing (multiple PDFs at once)
- User authentication or multi-tenancy
- Persistent storage of extracted data
- Automated UTM-to-WGS84 conversion for non-standard reference systems
- Mobile / responsive design (desktop-only for v1)
- Integration with external property databases (IPTU records, cartório registries)
- Automatic detection of property boundaries from satellite imagery
