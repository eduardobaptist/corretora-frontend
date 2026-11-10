// Espelha o JSON de GET /imoveis e GET /imoveis/{id} da API Spring (docs/openapi.yaml).

export interface TipoImovel {
  id: number;
  nome: string;
  descricao: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bairro {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
  cepInicial: string | null;
  cepFinal: string | null;
}

export interface Imovel {
  id: number;
  titulo: string;
  descricao: string | null;
  precoVenda: number | null;
  precoAluguel: number | null;
  finalidade: string;
  status: string;
  dormitorios: number | null;
  banheiros: number | null;
  garagem: number | null;
  areaTotal: number | null;
  areaConstruida: number | null;
  endereco: string;
  numero: string | null;
  complemento: string | null;
  cep: string | null;
  /** Lista separada por vírgula, ex.: "Piscina, Churrasqueira, Jardim" */
  caracteristicas: string | null;
  destaque: boolean;
  tipoImovel: TipoImovel | null;
  bairro: Bairro | null;
  /** URLs absolutas e públicas das fotos (capa primeiro). Vazio se não houver fotos. */
  fotos: string[];
  createdAt: string;
  updatedAt: string;
}

/** Corpo de POST /imoveis/sabermais/{id}. Todos obrigatórios (nulo → 500 na API). */
export interface ImovelSaberMais {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
}
