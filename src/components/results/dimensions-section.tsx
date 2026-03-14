"use client";

import { Ruler } from "lucide-react";
import { formatLinear } from "@/lib/utils/format";
import type { Dimensoes } from "@/lib/types/matricula";

interface DimensionsSectionProps {
  dimensoes: Dimensoes;
}

export function DimensionsSection({ dimensoes }: DimensionsSectionProps) {
  const { testada, fundos, lateralDireita, lateralEsquerda, descricaoFormaIrregular } = dimensoes;
  const hasAny = testada || fundos || lateralDireita || lateralEsquerda;

  if (!hasAny) return null;

  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-medium flex items-center gap-1.5">
        <Ruler className="h-3.5 w-3.5" />
        Dimensões
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {testada && (
          <div>
            <span className="text-muted-foreground">Testada:</span>{" "}
            <span className="font-medium">{formatLinear(testada.metros)}</span>
          </div>
        )}
        {fundos && (
          <div>
            <span className="text-muted-foreground">Fundos:</span>{" "}
            <span className="font-medium">{formatLinear(fundos.metros)}</span>
          </div>
        )}
        {lateralDireita && (
          <div>
            <span className="text-muted-foreground">Lat. Direita:</span>{" "}
            <span className="font-medium">{formatLinear(lateralDireita.metros)}</span>
          </div>
        )}
        {lateralEsquerda && (
          <div>
            <span className="text-muted-foreground">Lat. Esquerda:</span>{" "}
            <span className="font-medium">{formatLinear(lateralEsquerda.metros)}</span>
          </div>
        )}
      </div>
      {descricaoFormaIrregular && (
        <p className="text-xs text-muted-foreground italic">{descricaoFormaIrregular}</p>
      )}
    </div>
  );
}
