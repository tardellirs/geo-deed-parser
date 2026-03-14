import { NextRequest, NextResponse } from "next/server";
import { buildKml } from "@/lib/geo/kml-builder";

export async function POST(request: NextRequest) {
  try {
    const { matricula, polygon, center } = await request.json();

    if (!matricula) {
      return NextResponse.json(
        { error: "Dados da matrícula são obrigatórios" },
        { status: 400 }
      );
    }

    if (!center || typeof center.lat !== "number" || typeof center.lng !== "number") {
      return NextResponse.json(
        { error: "Coordenadas centrais são obrigatórias" },
        { status: 400 }
      );
    }

    const kmlContent = buildKml(matricula, polygon, center);
    const fileName = `matricula-${matricula.registro.numeroMatricula || "export"}.kml`;

    return new NextResponse(kmlContent, {
      headers: {
        "Content-Type": "application/vnd.google-earth.kml+xml",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("KML export error:", error);
    return NextResponse.json(
      { error: "Falha ao gerar arquivo KML" },
      { status: 500 }
    );
  }
}
