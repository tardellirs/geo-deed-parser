export const SYSTEM_INSTRUCTION = `Você é um especialista em análise de matrículas de imóveis brasileiras (registros de cartórios de imóveis). Sua tarefa é extrair dados estruturados de documentos de matrícula enviados como PDF.

REGRAS CRÍTICAS:

1. CRONOLOGIA: Leia o documento inteiro cronologicamente. Averbações posteriores SUBSTITUEM informações anteriores. Sempre use o dado MAIS RECENTE e válido.

2. ENDEREÇO: Existe uma diferença crucial entre o endereço do CARTÓRIO e o endereço do IMÓVEL. O endereço do cartório geralmente aparece no cabeçalho ou timbre do documento. O endereço do imóvel aparece na descrição do registro/matrícula. Extraia APENAS o endereço do imóvel. NUNCA confunda os dois.

3. ÁREA CONSTRUÍDA: Calcule a área líquida somando todas as construções e subtraindo todas as demolições registradas em averbações. Mantenha o histórico completo de alterações com datas.

4. ÔNUS: Identifique TODOS os ônus registrados (penhora, hipoteca, alienação fiduciária, usufruto, servidão, indisponibilidade). Verifique se foram cancelados em averbações posteriores. Marque como ativo=false se cancelado.

5. STATUS: Verifique se a matrícula foi ENCERRADA. Se sim, defina alertaEncerramento=true. Isso é informação crítica para o usuário.

6. COORDENADAS: Se o documento contiver coordenadas geográficas (UTM ou lat/lng), extraia TODAS na ordem em que definem o perímetro do terreno. Se forem UTM (SIRGAS 2000), converta para latitude/longitude WGS84.

7. CONFIANÇA: Para cada campo, avalie sua confiança. Se um campo é ambíguo, ilegível ou ausente, indique baixa confiança e explique nas notas (aiNotes). Liste os campos incertos em uncertainFields.

8. FORMATO: Responda EXCLUSIVAMENTE em JSON válido seguindo o schema fornecido. Use null para campos não encontrados. Não inclua texto fora do JSON.

9. ENDEREÇO COMPLETO: No campo enderecoCompleto, monte uma string formatada para geocodificação: "{logradouro}, {numero} - {bairro}, {cidade} - {estado}, {cep}". Omita partes nulas.`;

export const USER_PROMPT = `Analise este documento de matrícula de imóvel e extraia todos os dados conforme o schema JSON.

Instruções adicionais:
- Se houver múltiplas averbações que alteram o mesmo campo, use o valor mais recente.
- Para área construída, some construções e subtraia demolições para obter o valor líquido.
- Identifique se esta é uma matrícula de terreno, casa, apartamento ou condomínio.
- Se as coordenadas estiverem em UTM, converta para latitude/longitude (datum SIRGAS 2000 / WGS84).
- Se algum campo não existir no documento, use null.
- Para campos numéricos de área e dimensão, use o valor em metros/metros quadrados como número decimal.`;

const medidaLinear = {
  type: "object" as const,
  properties: {
    metros: { type: "number" as const },
    confrontante: { type: "string" as const, nullable: true },
  },
  required: ["metros", "confrontante"] as const,
};

const areaMedida = {
  type: "object" as const,
  properties: {
    metrosQuadrados: { type: "number" as const },
  },
  required: ["metrosQuadrados"] as const,
};

export function getResponseSchema() {
  return {
    type: "object" as const,
    properties: {
      registro: {
        type: "object" as const,
        properties: {
          numeroMatricula: { type: "string" as const },
          cartorio: {
            type: "object" as const,
            properties: {
              numero: { type: "number" as const },
              nome: { type: "string" as const },
              cidade: { type: "string" as const },
              estado: { type: "string" as const },
            },
            required: ["numero", "nome", "cidade", "estado"] as const,
          },
        },
        required: ["numeroMatricula", "cartorio"] as const,
      },
      endereco: {
        type: "object" as const,
        properties: {
          logradouro: { type: "string" as const },
          numero: { type: "string" as const, nullable: true },
          complemento: { type: "string" as const, nullable: true },
          bairro: { type: "string" as const },
          cidade: { type: "string" as const },
          estado: { type: "string" as const },
          cep: { type: "string" as const, nullable: true },
          lote: { type: "string" as const, nullable: true },
          quadra: { type: "string" as const, nullable: true },
          loteamento: { type: "string" as const, nullable: true },
          enderecoCompleto: { type: "string" as const },
        },
        required: [
          "logradouro", "numero", "complemento", "bairro", "cidade",
          "estado", "cep", "lote", "quadra", "loteamento", "enderecoCompleto",
        ] as const,
      },
      dimensoes: {
        type: "object" as const,
        properties: {
          testada: { ...medidaLinear, nullable: true },
          fundos: { ...medidaLinear, nullable: true },
          lateralDireita: { ...medidaLinear, nullable: true },
          lateralEsquerda: { ...medidaLinear, nullable: true },
          descricaoFormaIrregular: { type: "string" as const, nullable: true },
        },
        required: [
          "testada", "fundos", "lateralDireita", "lateralEsquerda",
          "descricaoFormaIrregular",
        ] as const,
      },
      areas: {
        type: "object" as const,
        properties: {
          terreno: areaMedida,
          privativa: { ...areaMedida, nullable: true },
          comum: { ...areaMedida, nullable: true },
          totalCondominio: { ...areaMedida, nullable: true },
          construida: {
            type: "object" as const,
            properties: {
              bruta: { type: "number" as const },
              demolicoes: { type: "number" as const },
              liquida: { type: "number" as const },
              historicoAlteracoes: {
                type: "array" as const,
                items: {
                  type: "object" as const,
                  properties: {
                    tipo: { type: "string" as const, enum: ["construcao", "demolicao", "reforma"] },
                    area: { type: "number" as const },
                    dataAverbacao: { type: "string" as const, nullable: true },
                    descricao: { type: "string" as const },
                  },
                  required: ["tipo", "area", "dataAverbacao", "descricao"] as const,
                },
              },
            },
            required: ["bruta", "demolicoes", "liquida", "historicoAlteracoes"] as const,
          },
          app: { ...areaMedida, nullable: true },
        },
        required: ["terreno", "privativa", "comum", "totalCondominio", "construida", "app"] as const,
      },
      fiscal: {
        type: "object" as const,
        properties: {
          inscricaoCadastral: { type: "string" as const, nullable: true },
          iptu: { type: "string" as const, nullable: true },
        },
        required: ["inscricaoCadastral", "iptu"] as const,
      },
      status: {
        type: "object" as const,
        properties: {
          ativa: { type: "boolean" as const },
          encerrada: { type: "boolean" as const },
          motivoEncerramento: { type: "string" as const, nullable: true },
          alertaEncerramento: { type: "boolean" as const },
        },
        required: ["ativa", "encerrada", "motivoEncerramento", "alertaEncerramento"] as const,
      },
      onus: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            tipo: {
              type: "string" as const,
              enum: [
                "penhora", "hipoteca", "alienacao_fiduciaria",
                "usufruto", "servidao", "indisponibilidade", "outro",
              ],
            },
            descricao: { type: "string" as const },
            dataRegistro: { type: "string" as const, nullable: true },
            dataCancelamento: { type: "string" as const, nullable: true },
            ativo: { type: "boolean" as const },
            valor: { type: "number" as const, nullable: true },
            beneficiario: { type: "string" as const, nullable: true },
          },
          required: [
            "tipo", "descricao", "dataRegistro", "dataCancelamento",
            "ativo", "valor", "beneficiario",
          ] as const,
        },
      },
      coordenadas: {
        type: "array" as const,
        nullable: true,
        items: {
          type: "object" as const,
          properties: {
            lat: { type: "number" as const },
            lng: { type: "number" as const },
            label: { type: "string" as const, nullable: true },
          },
          required: ["lat", "lng", "label"] as const,
        },
      },
      aiNotes: {
        type: "object" as const,
        properties: {
          confidence: { type: "string" as const, enum: ["high", "medium", "low"] },
          uncertainFields: { type: "array" as const, items: { type: "string" as const } },
          notes: { type: "array" as const, items: { type: "string" as const } },
        },
        required: ["confidence", "uncertainFields", "notes"] as const,
      },
    },
    required: [
      "registro", "endereco", "dimensoes", "areas", "fiscal",
      "status", "onus", "coordenadas", "aiNotes",
    ] as const,
  };
}
