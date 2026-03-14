"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, RotateCcw, Copy } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useCallback, useState } from "react";

interface ExportActionsProps {
  onReset: () => void;
}

export function ExportActions({ onReset }: ExportActionsProps) {
  const { matricula, polygon, geocoding } = useAppStore();
  const [copied, setCopied] = useState(false);

  const canExportKml = !!geocoding;

  const handleExportKml = useCallback(async () => {
    if (!matricula || !geocoding) return;

    try {
      const response = await fetch("/api/export/kml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricula,
          polygon,
          center: { lat: geocoding.lat, lng: geocoding.lng },
        }),
      });

      if (!response.ok) throw new Error("Falha ao gerar KML");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `matricula-${matricula.registro.numeroMatricula}.kml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("KML export failed:", error);
    }
  }, [matricula, polygon, geocoding]);

  const handleCopy = useCallback(async () => {
    if (!matricula) return;

    const { registro, endereco, areas, dimensoes, fiscal } = matricula;
    const text = [
      `Matrícula: ${registro.numeroMatricula}`,
      `Cartório: ${registro.cartorio.numero}º ${registro.cartorio.nome}`,
      `Endereço: ${endereco.enderecoCompleto}`,
      endereco.lote ? `Lote: ${endereco.lote}` : null,
      endereco.quadra ? `Quadra: ${endereco.quadra}` : null,
      `Área Terreno: ${areas.terreno.metrosQuadrados.toFixed(2)} m²`,
      `Área Construída: ${areas.construida.liquida.toFixed(2)} m²`,
      areas.app ? `Área APP: ${areas.app.metrosQuadrados.toFixed(2)} m²` : null,
      dimensoes.testada ? `Testada: ${dimensoes.testada.metros.toFixed(2)} m` : null,
      fiscal.iptu ? `IPTU: ${fiscal.iptu}` : null,
      fiscal.inscricaoCadastral ? `Inscrição: ${fiscal.inscricaoCadastral}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [matricula]);

  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="default"
              size="sm"
              onClick={handleExportKml}
              disabled={!canExportKml}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Exportar KML
            </Button>
          </span>
        </TooltipTrigger>
        {!canExportKml && (
          <TooltipContent>
            <p>Sem dados de localização para exportar</p>
          </TooltipContent>
        )}
      </Tooltip>

      <Button variant="outline" size="sm" onClick={handleCopy}>
        <Copy className="h-3.5 w-3.5 mr-1.5" />
        {copied ? "Copiado!" : "Copiar"}
      </Button>

      <Button variant="ghost" size="sm" onClick={onReset}>
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
        Nova Matrícula
      </Button>
    </div>
  );
}
