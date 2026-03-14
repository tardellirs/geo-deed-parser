import { z } from "zod";

const medidaLinearSchema = z.object({
  metros: z.number(),
  confrontante: z.string().nullable(),
});

const areaMedidaSchema = z.object({
  metrosQuadrados: z.number(),
});

const alteracaoConstrucaoSchema = z.object({
  tipo: z.enum(["construcao", "demolicao", "reforma"]),
  area: z.number(),
  dataAverbacao: z.string().nullable(),
  descricao: z.string(),
});

const areaConstruidaSchema = z.object({
  bruta: z.number(),
  demolicoes: z.number(),
  liquida: z.number(),
  historicoAlteracoes: z.array(alteracaoConstrucaoSchema),
});

const tipoOnusSchema = z.enum([
  "penhora",
  "hipoteca",
  "alienacao_fiduciaria",
  "usufruto",
  "servidao",
  "indisponibilidade",
  "outro",
]);

const onusSchema = z.object({
  tipo: tipoOnusSchema,
  descricao: z.string(),
  dataRegistro: z.string().nullable(),
  dataCancelamento: z.string().nullable(),
  ativo: z.boolean(),
  valor: z.number().nullable(),
  beneficiario: z.string().nullable(),
});

const coordenadaSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  label: z.string().nullable(),
});

export const matriculaDataSchema = z.object({
  registro: z.object({
    numeroMatricula: z.string(),
    cartorio: z.object({
      numero: z.number(),
      nome: z.string(),
      cidade: z.string(),
      estado: z.string(),
    }),
  }),
  endereco: z.object({
    logradouro: z.string(),
    numero: z.string().nullable(),
    complemento: z.string().nullable(),
    bairro: z.string(),
    cidade: z.string(),
    estado: z.string(),
    cep: z.string().nullable(),
    lote: z.string().nullable(),
    quadra: z.string().nullable(),
    loteamento: z.string().nullable(),
    enderecoCompleto: z.string(),
  }),
  dimensoes: z.object({
    testada: medidaLinearSchema.nullable(),
    fundos: medidaLinearSchema.nullable(),
    lateralDireita: medidaLinearSchema.nullable(),
    lateralEsquerda: medidaLinearSchema.nullable(),
    descricaoFormaIrregular: z.string().nullable(),
  }),
  areas: z.object({
    terreno: areaMedidaSchema,
    privativa: areaMedidaSchema.nullable(),
    comum: areaMedidaSchema.nullable(),
    totalCondominio: areaMedidaSchema.nullable(),
    construida: areaConstruidaSchema,
    app: areaMedidaSchema.nullable(),
  }),
  fiscal: z.object({
    inscricaoCadastral: z.string().nullable(),
    iptu: z.string().nullable(),
  }),
  status: z.object({
    ativa: z.boolean(),
    encerrada: z.boolean(),
    motivoEncerramento: z.string().nullable(),
    alertaEncerramento: z.boolean(),
  }),
  onus: z.array(onusSchema),
  coordenadas: z.array(coordenadaSchema).nullable(),
  aiNotes: z.object({
    confidence: z.enum(["high", "medium", "low"]),
    uncertainFields: z.array(z.string()),
    notes: z.array(z.string()),
  }),
});

export type MatriculaDataFromSchema = z.infer<typeof matriculaDataSchema>;
