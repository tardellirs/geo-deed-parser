"use client";

import { MapPin } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-14 items-center border-b border-border bg-background px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-none">Geo Deed Parser</h1>
          <p className="text-xs text-muted-foreground">M2G2 Patrimonial</p>
        </div>
      </div>
    </header>
  );
}
