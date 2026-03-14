"use client";

import { MapPin } from "lucide-react";
import type { EnderecoImovel } from "@/lib/types/matricula";

interface AddressSectionProps {
  endereco: EnderecoImovel;
}

export function AddressSection({ endereco }: AddressSectionProps) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-medium flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" />
        Endereço do Imóvel
      </h3>
      <p className="text-sm text-muted-foreground">{endereco.enderecoCompleto}</p>
      {(endereco.lote || endereco.quadra) && (
        <p className="text-xs text-muted-foreground">
          {endereco.lote && `Lote ${endereco.lote}`}
          {endereco.lote && endereco.quadra && " — "}
          {endereco.quadra && `Quadra ${endereco.quadra}`}
          {endereco.loteamento && ` — ${endereco.loteamento}`}
        </p>
      )}
    </div>
  );
}
