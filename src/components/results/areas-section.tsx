"use client";

import { Square } from "lucide-react";
import { formatArea } from "@/lib/utils/format";
import type { Areas } from "@/lib/types/matricula";

interface AreasSectionProps {
  areas: Areas;
}

export function AreasSection({ areas }: AreasSectionProps) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-medium flex items-center gap-1.5">
        <Square className="h-3.5 w-3.5" />
        Áreas
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <span className="text-muted-foreground">Terreno:</span>{" "}
          <span className="font-medium">{formatArea(areas.terreno.metrosQuadrados)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Construída:</span>{" "}
          <span className="font-medium">{formatArea(areas.construida.liquida)}</span>
        </div>
        {areas.privativa && (
          <div>
            <span className="text-muted-foreground">Privativa:</span>{" "}
            <span className="font-medium">{formatArea(areas.privativa.metrosQuadrados)}</span>
          </div>
        )}
        {areas.comum && (
          <div>
            <span className="text-muted-foreground">Comum:</span>{" "}
            <span className="font-medium">{formatArea(areas.comum.metrosQuadrados)}</span>
          </div>
        )}
        {areas.totalCondominio && (
          <div>
            <span className="text-muted-foreground">Total Cond.:</span>{" "}
            <span className="font-medium">{formatArea(areas.totalCondominio.metrosQuadrados)}</span>
          </div>
        )}
        {areas.app && (
          <div>
            <span className="text-muted-foreground">APP:</span>{" "}
            <span className="font-medium">{formatArea(areas.app.metrosQuadrados)}</span>
          </div>
        )}
      </div>

      {areas.construida.historicoAlteracoes.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Histórico de construção:</p>
          <div className="space-y-0.5">
            {areas.construida.historicoAlteracoes.map((alt, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                <span className={alt.tipo === "demolicao" ? "text-red-600" : "text-green-600"}>
                  {alt.tipo === "construcao" ? "+" : alt.tipo === "demolicao" ? "-" : "~"}
                  {formatArea(alt.area)}
                </span>
                {" — "}{alt.descricao}
                {alt.dataAverbacao && ` (${alt.dataAverbacao})`}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
