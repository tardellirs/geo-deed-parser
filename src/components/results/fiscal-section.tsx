"use client";

import { FileText } from "lucide-react";
import type { FiscalInfo } from "@/lib/types/matricula";

interface FiscalSectionProps {
  fiscal: FiscalInfo;
}

export function FiscalSection({ fiscal }: FiscalSectionProps) {
  if (!fiscal.inscricaoCadastral && !fiscal.iptu) return null;

  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-medium flex items-center gap-1.5">
        <FileText className="h-3.5 w-3.5" />
        Dados Fiscais
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {fiscal.inscricaoCadastral && (
          <div>
            <span className="text-muted-foreground">Inscrição:</span>{" "}
            <span className="font-medium">{fiscal.inscricaoCadastral}</span>
          </div>
        )}
        {fiscal.iptu && (
          <div>
            <span className="text-muted-foreground">IPTU:</span>{" "}
            <span className="font-medium">{fiscal.iptu}</span>
          </div>
        )}
      </div>
    </div>
  );
}
