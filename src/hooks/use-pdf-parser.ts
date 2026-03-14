"use client";

import { useCallback, useRef, useState } from "react";
import { useAppStore } from "@/stores/app-store";
import type { MatriculaData } from "@/lib/types/matricula";
import type { ProgressEvent } from "@/lib/types/processing";

export function usePdfParser() {
  const [fileName, setFileName] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const {
    setAppState,
    setProgress,
    setMatricula,
    setErrorMessage,
  } = useAppStore();

  const parseFile = useCallback(
    async (file: File) => {
      // Cancel any existing request
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      setFileName(file.name);
      setAppState("processing");
      setProgress({ step: "uploading", message: "Preparando envio...", percent: 5 });
      setErrorMessage(null);
      setMatricula(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/parse", {
          method: "POST",
          body: formData,
          signal: abort.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error("Falha na conexão com o servidor.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE messages from buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let eventType = "";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.slice(6);

              try {
                const data = JSON.parse(dataStr);

                if (eventType === "progress") {
                  setProgress(data as ProgressEvent);
                } else if (eventType === "complete" && data.success) {
                  setMatricula(data.data as MatriculaData);
                  setAppState("complete");
                } else if (eventType === "error") {
                  setErrorMessage(data.error?.message || "Erro ao processar.");
                  setAppState("error");
                }
              } catch {
                // Incomplete JSON, wait for more data
              }

              eventType = "";
              dataStr = "";
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setErrorMessage(
          error instanceof Error ? error.message : "Erro inesperado."
        );
        setAppState("error");
      }
    },
    [setAppState, setProgress, setMatricula, setErrorMessage]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setAppState("idle");
    setProgress(null);
  }, [setAppState, setProgress]);

  return { parseFile, cancel, fileName };
}
