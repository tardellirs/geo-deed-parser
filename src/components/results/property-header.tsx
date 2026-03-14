"use client";

import { Badge } from "@/components/ui/badge";
import type { MatriculaData } from "@/lib/types/matricula";

interface PropertyHeaderProps {
  data: MatriculaData;
}

export function PropertyHeader({ data }: PropertyHeaderProps) {
  const { registro, status, aiNotes } = data;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Matrícula {registro.numeroMatricula}
        </h2>
        <div className="flex gap-1.5">
          {status.ativa && (
            <Badge variant="default" className="bg-green-600">Ativa</Badge>
          )}
          {status.encerrada && (
            <Badge variant="destructive">Encerrada</Badge>
          )}
          <Badge
            variant="outline"
            className={
              aiNotes.confidence === "high"
                ? "border-green-500 text-green-700"
                : aiNotes.confidence === "medium"
                ? "border-yellow-500 text-yellow-700"
                : "border-red-500 text-red-700"
            }
          >
            {aiNotes.confidence === "high"
              ? "Alta confiança"
              : aiNotes.confidence === "medium"
              ? "Média confiança"
              : "Baixa confiança"}
          </Badge>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {registro.cartorio.numero}º {registro.cartorio.nome} — {registro.cartorio.cidade}/{registro.cartorio.estado}
      </p>
    </div>
  );
}
