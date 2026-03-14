import { NextRequest } from "next/server";
import { parseMatricula } from "@/lib/gemini/parser";
import { FileValidationError, GeoParserError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
          throw new FileValidationError("Nenhum arquivo enviado.");
        }

        if (file.type !== "application/pdf") {
          throw new FileValidationError("Formato inválido. Envie apenas PDF.");
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new FileValidationError("Arquivo muito grande. Máximo: 50MB.");
        }

        const buffer = await file.arrayBuffer();

        const data = await parseMatricula(
          buffer,
          file.name,
          (step, message, percent) => {
            controller.enqueue(
              encoder.encode(sseMessage("progress", { step, message, percent }))
            );
          }
        );

        controller.enqueue(
          encoder.encode(
            sseMessage("complete", { success: true, data })
          )
        );
      } catch (error) {
        const isKnown = error instanceof GeoParserError;
        controller.enqueue(
          encoder.encode(
            sseMessage("error", {
              success: false,
              error: {
                code: isKnown ? error.code : "UNKNOWN_ERROR",
                message: isKnown
                  ? error.message
                  : "Erro inesperado ao processar documento.",
                details: isKnown ? error.details : undefined,
              },
            })
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
