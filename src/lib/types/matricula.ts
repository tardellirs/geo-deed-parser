export interface MatriculaData {
  meta: ExtractionMeta;
  registro: RegistroInfo;
  endereco: EnderecoImovel;
  dimensoes: Dimensoes;
  areas: Areas;
  fiscal: FiscalInfo;
  status: MatriculaStatus;
  onus: Onus[];
  coordenadas: Coordenada[] | null;
  aiNotes: AiNotes;
}

export interface ExtractionMeta {
  extractedAt: string;
  modelUsed: string;
  documentPages: number;
  processingTimeMs: number;
}

export interface RegistroInfo {
  numeroMatricula: string;
  cartorio: {
    numero: number;
    nome: string;
    cidade: string;
    estado: string;
  };
}

export interface EnderecoImovel {
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string | null;
  lote: string | null;
  quadra: string | null;
  loteamento: string | null;
  enderecoCompleto: string;
}

export interface MedidaLinear {
  metros: number;
  confrontante: string | null;
}

export interface Dimensoes {
  testada: MedidaLinear | null;
  fundos: MedidaLinear | null;
  lateralDireita: MedidaLinear | null;
  lateralEsquerda: MedidaLinear | null;
  descricaoFormaIrregular: string | null;
}

export interface AreaMedida {
  metrosQuadrados: number;
}

export interface AlteracaoConstrucao {
  tipo: "construcao" | "demolicao" | "reforma";
  area: number;
  dataAverbacao: string | null;
  descricao: string;
}

export interface AreaConstruida {
  bruta: number;
  demolicoes: number;
  liquida: number;
  historicoAlteracoes: AlteracaoConstrucao[];
}

export interface Areas {
  terreno: AreaMedida;
  privativa: AreaMedida | null;
  comum: AreaMedida | null;
  totalCondominio: AreaMedida | null;
  construida: AreaConstruida;
  app: AreaMedida | null;
}

export interface FiscalInfo {
  inscricaoCadastral: string | null;
  iptu: string | null;
}

export interface MatriculaStatus {
  ativa: boolean;
  encerrada: boolean;
  motivoEncerramento: string | null;
  alertaEncerramento: boolean;
}

export type TipoOnus =
  | "penhora"
  | "hipoteca"
  | "alienacao_fiduciaria"
  | "usufruto"
  | "servidao"
  | "indisponibilidade"
  | "outro";

export interface Onus {
  tipo: TipoOnus;
  descricao: string;
  dataRegistro: string | null;
  dataCancelamento: string | null;
  ativo: boolean;
  valor: number | null;
  beneficiario: string | null;
}

export interface Coordenada {
  lat: number;
  lng: number;
  label: string | null;
}

export interface AiNotes {
  confidence: "high" | "medium" | "low";
  uncertainFields: string[];
  notes: string[];
}
