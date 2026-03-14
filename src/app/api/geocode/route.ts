import { NextRequest, NextResponse } from "next/server";
import type { GeocodingResult } from "@/lib/types/geo";

export async function POST(request: NextRequest) {
  const { address } = await request.json();

  if (!address || typeof address !== "string") {
    return NextResponse.json(
      { error: "Endereço é obrigatório" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_SERVER_KEY não configurada" },
      { status: 500 }
    );
  }

  const query = `${address}, Brasil`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&language=pt-BR&region=br`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json(
        { error: "Endereço não encontrado", status: data.status },
        { status: 404 }
      );
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;

    // Determine confidence based on location_type
    let confidence: "high" | "medium" | "low" = "low";
    if (result.geometry.location_type === "ROOFTOP") {
      confidence = "high";
    } else if (
      result.geometry.location_type === "RANGE_INTERPOLATED" ||
      result.geometry.location_type === "GEOMETRIC_CENTER"
    ) {
      confidence = "medium";
    }

    const geocodingResult: GeocodingResult = {
      lat,
      lng,
      formattedAddress: result.formatted_address,
      confidence,
    };

    return NextResponse.json(geocodingResult);
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Falha na geocodificação" },
      { status: 500 }
    );
  }
}
