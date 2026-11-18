// Espelha o JSON de GET /imoveis e GET /imoveis/{id} da API Spring (docs/openapi.yaml).

import type { Bairro } from "@/features/bairros/types";
import type { TipoImovel } from "@/features/tipos-imoveis/types";

export type { Bairro, TipoImovel };

/**
 * Schema `StatusImovel`. Só `DISPONIVEL` recebe ofertas. Muda sozinho com o fluxo de ofertas:
 * oferta aceita → `RESERVADO`; contrato assinado → `ALUGADO`/`VENDIDO`; contrato cancelado →
 * `DISPONIVEL`. O admin também pode trocar no cadastro.
 */
export type StatusImovel = "DISPONIVEL" | "RESERVADO" | "ALUGADO" | "VENDIDO";

export const STATUS_IMOVEL: readonly StatusImovel[] = ["DISPONIVEL", "RESERVADO", "ALUGADO", "VENDIDO"];

export const ROTULO_STATUS_IMOVEL: Record<StatusImovel, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  ALUGADO: "Alugado",
  VENDIDO: "Vendido",
};

export function statusImovelValido(valor: string): StatusImovel | null {
  return (STATUS_IMOVEL as readonly string[]).includes(valor) ? (valor as StatusImovel) : null;
}

export interface Imovel {
  id: number;
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

/** Corpo de POST /imoveis/sabermais/{id}. Telefone opcional; o resto obrigatório. */
export interface ImovelSaberMais {
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string;
}
