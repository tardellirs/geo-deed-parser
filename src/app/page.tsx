"use client";

import { useCallback, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { MainLayout } from "@/components/layout/main-layout";
import { Dropzone } from "@/components/upload/dropzone";
import { ProcessingStatus } from "@/components/upload/processing-status";
import { ResultsPanel } from "@/components/results/results-panel";
import { MapContainer } from "@/components/map/map-container";
import { useAppStore } from "@/stores/app-store";
import { usePdfParser } from "@/hooks/use-pdf-parser";
import { usePolygon } from "@/hooks/use-polygon";
import { geocodeAddress } from "@/lib/geo/geocoder";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const {
    appState,
    progress,
    matricula,
    errorMessage,
    setGeocoding,
    setGeocodingError,
    reset,
  } = useAppStore();

  const { parseFile, fileName } = usePdfParser();

  // Compute polygon from data
  usePolygon();

  // Geocode when matricula data arrives
  useEffect(() => {
    if (!matricula) return;

    const address = matricula.endereco.enderecoCompleto;
    if (!address) return;

    geocodeAddress(address)
      .then((result) => {
        setGeocoding(result);
        setGeocodingError(null);
      })
      .catch((err) => {
        console.warn("Geocoding failed:", err.message);
        setGeocodingError(
          "Endereço não localizado no mapa. Verifique se a Geocoding API está habilitada no Google Cloud Console."
        );
      });
  }, [matricula, setGeocoding]);

  const handleFileAccepted = useCallback(
    (file: File) => {
      parseFile(file);
    },
    [parseFile]
  );

  const leftPanel = (
    <>
      {appState === "idle" && (
        <Dropzone onFileAccepted={handleFileAccepted} />
      )}

      {appState === "processing" && progress && (
        <ProcessingStatus progress={progress} fileName={fileName} />
      )}

      {appState === "complete" && matricula && (
        <ResultsPanel data={matricula} onReset={reset} />
      )}

      {appState === "error" && (
        <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">
              Erro ao processar matrícula
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {errorMessage}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Tentar novamente
          </Button>
        </div>
      )}
    </>
  );

  const rightPanel = <MapContainer />;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <MainLayout leftPanel={leftPanel} rightPanel={rightPanel} />
    </div>
  );
}
