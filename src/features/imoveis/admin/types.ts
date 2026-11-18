// Corpo de POST/PUT /imoveis (schema `ImovelInput` em docs/openapi.yaml).
// O PUT substitui tudo: campo omitido vira `null`, então o formulário manda todos.
// `fotos` não faz parte (é ignorado no POST/PUT).

import type { StatusImovel } from "../types";

/** Rota da lista de imóveis do admin (novo: `/novo`, edição: `/{id}`). */
export const ADMIN_IMOVEIS = "/admin/imoveis";

export interface IdRef {
  id: number;
}

export interface ImovelInput {
  titulo: string;
  descricao: string | null;
  precoVenda: number | null;
  precoAluguel: number | null;
  finalidade: string;
  status: StatusImovel;
  dormitorios: number | null;
  banheiros: number | null;
  garagem: number | null;
  areaTotal: number | null;
  areaConstruida: number | null;
  endereco: string;
  numero: string | null;
  complemento: string | null;
  cep: string | null;
  caracteristicas: string | null;
  destaque: boolean;
  tipoImovel: IdRef | null;
  bairro: IdRef | null;
}

export type ImovelCampo = keyof ImovelInput;

// `finalidade` é texto livre na API: o formulário sugere estes valores (mais os já usados nos
// cadastros), mas aceita qualquer texto. `status` é enum (`StatusImovel`): vai num Select.
export const SUGESTOES_FINALIDADE = ["Residencial", "Comercial", "Rural"];
