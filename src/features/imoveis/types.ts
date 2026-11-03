// Espelha o JSON de GET /imoveis da API Spring.

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
  createdAt: string;
  updatedAt: string;
}
