"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import type { ProgressEvent } from "@/lib/types/processing";

interface ProcessingStatusProps {
  progress: ProgressEvent;
  fileName: string;
}

export function ProcessingStatus({ progress, fileName }: ProcessingStatusProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-medium text-foreground">
            Processando matrícula
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-full">
            {fileName}
          </p>
        </div>

        <div className="space-y-2">
          <Progress value={progress.percent} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress.message}
          </p>
        </div>
      </div>
    </div>
  );
}
