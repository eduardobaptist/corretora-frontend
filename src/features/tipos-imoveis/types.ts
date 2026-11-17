// Espelha os schemas `TipoImovel` e `TipoImovelInput` da API (docs/openapi.yaml).

export interface TipoImovel {
  id: number;
  nome: string;
  descricao: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de POST/PUT /tipos-imoveis. O PUT substitui tudo: mande todos os campos. */
export interface TipoImovelInput {
  nome: string;
  descricao: string | null;
}
