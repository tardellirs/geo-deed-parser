import { getGeminiClient, GEMINI_MODEL } from "./client";
import { SYSTEM_INSTRUCTION, USER_PROMPT, getResponseSchema } from "./prompt";
import { matriculaDataSchema } from "@/lib/validation/matricula-schema";
import { GeminiApiError, ExtractionError } from "@/lib/utils/errors";
import type { MatriculaData } from "@/lib/types/matricula";

type ProgressCallback = (step: string, message: string, percent: number) => void;

export async function parseMatricula(
  fileBuffer: ArrayBuffer,
  fileName: string,
  onProgress: ProgressCallback
): Promise<MatriculaData> {
  const client = getGeminiClient();
  const startTime = Date.now();

  onProgress("uploading", "Enviando documento para análise...", 10);

  // Convert buffer to base64 for inline data
  const base64Data = Buffer.from(fileBuffer).toString("base64");

  onProgress("analyzing", "Analisando documento com IA...", 20);
  onProgress("reading_averbacoes", "Lendo averbações...", 35);

  let responseText: string;
  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
            { text: USER_PROMPT },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: getResponseSchema(),
        temperature: 0.1,
      },
    });

    responseText = response.text ?? "";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    throw new GeminiApiError(
      "Falha ao processar documento com a IA.",
      message
    );
  }

  onProgress("extracting_dimensions", "Extraindo coordenadas e dimensões...", 70);
  onProgress("validating", "Validando dados extraídos...", 85);

  // Parse JSON response
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new ExtractionError(
      "Falha ao interpretar resposta da IA.",
      `Response was not valid JSON: ${responseText.substring(0, 200)}`
    );
  }

  // Validate with Zod
  const result = matriculaDataSchema.safeParse(parsed);
  if (!result.success) {
    // Try partial: return what we can with low confidence
    console.error("Zod validation errors:", result.error.issues);
    throw new ExtractionError(
      "Dados extraídos incompletos ou inválidos.",
      result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
    );
  }

  const processingTimeMs = Date.now() - startTime;

  // Build full MatriculaData with meta
  const matriculaData: MatriculaData = {
    ...result.data,
    meta: {
      extractedAt: new Date().toISOString(),
      modelUsed: GEMINI_MODEL,
      documentPages: 0, // Gemini doesn't report this directly
      processingTimeMs,
    },
  };

  onProgress("complete", "Extração concluída!", 100);

  return matriculaData;
}
