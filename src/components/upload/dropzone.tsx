"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function Dropzone({ onFileAccepted }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      maxSize: MAX_FILE_SIZE,
    });

  const rejection = fileRejections[0];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center w-full p-12
          border-2 border-dashed rounded-xl cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          {isDragActive ? (
            <FileText className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>
        {isDragActive ? (
          <p className="text-sm font-medium text-primary">
            Solte o arquivo aqui...
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground mb-1">
              Arraste o PDF da matrícula aqui
            </p>
            <p className="text-xs text-muted-foreground">
              ou clique para selecionar (máx. 50MB)
            </p>
          </>
        )}
      </div>

      {rejection && (
        <div className="flex items-center gap-2 mt-4 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>
            {rejection.errors[0]?.code === "file-too-large"
              ? "Arquivo muito grande. Máximo permitido: 50MB."
              : rejection.errors[0]?.code === "file-invalid-type"
              ? "Formato inválido. Envie apenas arquivos PDF."
              : "Erro ao processar arquivo."}
          </span>
        </div>
      )}
    </div>
  );
}
