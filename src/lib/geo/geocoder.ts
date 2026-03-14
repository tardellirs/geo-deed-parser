import type { GeocodingResult } from "@/lib/types/geo";

export async function geocodeAddress(
  address: string
): Promise<GeocodingResult> {
  const response = await fetch("/api/geocode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Falha na geocodificação");
  }

  return response.json();
}
