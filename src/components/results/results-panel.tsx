"use client";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PropertyHeader } from "./property-header";
import { AlertsSection } from "./alerts-section";
import { AddressSection } from "./address-section";
import { DimensionsSection } from "./dimensions-section";
import { AreasSection } from "./areas-section";
import { FiscalSection } from "./fiscal-section";
import { ExportActions } from "./export-actions";
import { useAppStore } from "@/stores/app-store";
import { MapPin } from "lucide-react";
import type { MatriculaData } from "@/lib/types/matricula";

interface ResultsPanelProps {
  data: MatriculaData;
  onReset: () => void;
}

export function ResultsPanel({ data, onReset }: ResultsPanelProps) {
  const { geocodingError } = useAppStore();

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4">
        <PropertyHeader data={data} />
        <AlertsSection data={data} />
        <Separator />
        <AddressSection endereco={data.endereco} />
        <Separator />
        <DimensionsSection dimensoes={data.dimensoes} />
        {(data.dimensoes.testada || data.dimensoes.fundos) && <Separator />}
        <AreasSection areas={data.areas} />
        <Separator />
        <FiscalSection fiscal={data.fiscal} />
        {(data.fiscal.inscricaoCadastral || data.fiscal.iptu) && <Separator />}

        {data.aiNotes.notes.length > 0 && (
          <>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Notas da IA</h3>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {data.aiNotes.notes.map((note, i) => (
                  <li key={i}>- {note}</li>
                ))}
              </ul>
            </div>
            <Separator />
          </>
        )}

        {geocodingError && (
          <div className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-xs">
            <MapPin className="h-3.5 w-3.5 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-yellow-800">{geocodingError}</p>
          </div>
        )}

        <ExportActions onReset={onReset} />

        <p className="text-xs text-muted-foreground">
          Processado em {(data.meta.processingTimeMs / 1000).toFixed(1)}s via {data.meta.modelUsed}
        </p>
      </div>
    </ScrollArea>
  );
}
