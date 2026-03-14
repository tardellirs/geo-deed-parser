"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { MatriculaData } from "@/lib/types/matricula";

interface AlertsSectionProps {
  data: MatriculaData;
}

export function AlertsSection({ data }: AlertsSectionProps) {
  const { status, onus } = data;
  const onusAtivos = onus.filter((o) => o.ativo);

  if (!status.alertaEncerramento && onusAtivos.length === 0) return null;

  return (
    <div className="space-y-2">
      {status.alertaEncerramento && (
        <div className="flex items-start gap-2 rounded-md bg-orange-50 border border-orange-200 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-orange-800">Matrícula Encerrada</p>
            <p className="text-orange-700 text-xs">
              {status.motivoEncerramento || "Esta matrícula foi encerrada. Solicite a nova matrícula."}
            </p>
          </div>
        </div>
      )}

      {onusAtivos.map((o, i) => (
        <div
          key={i}
          className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm"
        >
          <ShieldAlert className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-800 capitalize">{o.tipo.replace(/_/g, " ")}</p>
            <p className="text-red-700 text-xs">{o.descricao}</p>
            {o.beneficiario && (
              <p className="text-red-600 text-xs mt-0.5">Beneficiário: {o.beneficiario}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
