// Espelha os schemas `Bairro` e `BairroInput` da API (docs/openapi.yaml).

export interface Bairro {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
  cepInicial: string | null;
  cepFinal: string | null;
}

/** Corpo de POST/PUT /bairros. O PUT substitui tudo: mande todos os campos. */
export type BairroInput = Omit<Bairro, "id">;

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
