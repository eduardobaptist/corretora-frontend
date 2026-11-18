// Espelha os schemas `Oferta`, `OfertaInput` e `OfertaStatusInput` da API (docs/openapi.yaml).

import type { Usuario } from "@/features/auth/types";
import type { StatusImovel } from "@/features/imoveis/types";

export type TipoOferta = "ALUGUEL" | "VENDA";

/**
 * `PENDENTE`/`EM_ESPERA` = em aberto (equivalentes); `ACEITA`, `RECUSADA`, `CANCELADA` = finais.
 * Mudam sozinhas: aceitar uma oferta põe as outras pendentes do imóvel em espera; assinar recusa as
 * outras em aberto; cancelar o contrato cancela a oferta dele e devolve as em espera a pendente.
 */
export type StatusOferta = "PENDENTE" | "ACEITA" | "EM_ESPERA" | "RECUSADA" | "CANCELADA";

/** O que o admin pode decidir (PATCH /ofertas/{id}/status). */
export type DecisaoOferta = "ACEITA" | "EM_ESPERA" | "RECUSADA";

/** Schema `ImovelResumo`. Preço 0 = "não se aplica" (ver `precoOuNull`). */
export interface ImovelResumo {
  id: number;
  titulo: string;
  precoVenda: number | null;
  precoAluguel: number | null;
  status: StatusImovel;
}

export interface Oferta {
  id: number;
  imovel: ImovelResumo;
  usuario: Usuario;
  tipo: TipoOferta;
  valorProposto: number;
  mensagem: string | null;
  status: StatusOferta;
  createdAt: string;
  updatedAt: string;
}

/** POST /ofertas (o usuário vem do token). */
export interface OfertaInput {
  imovelId: number;
  tipo: TipoOferta;
  valorProposto: number;
  mensagem: string | null;
}

export type OfertaCampo = "tipo" | "valorProposto" | "mensagem";

export const TIPOS_OFERTA: readonly TipoOferta[] = ["VENDA", "ALUGUEL"];

export const STATUS_OFERTA: readonly StatusOferta[] = ["PENDENTE", "EM_ESPERA", "ACEITA", "RECUSADA", "CANCELADA"];

export const ROTULO_TIPO_OFERTA: Record<TipoOferta, string> = { VENDA: "Venda", ALUGUEL: "Aluguel" };

export const ROTULO_STATUS_OFERTA: Record<StatusOferta, string> = {
  PENDENTE: "Pendente",
  EM_ESPERA: "Em espera",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
  CANCELADA: "Cancelada",
};

export const MAX_MENSAGEM_OFERTA = 2000;
/** `valorProposto`: até 13 dígitos inteiros e 2 casas. */
export const DIGITOS_VALOR_OFERTA = 13;

export function ofertaEmAberto(status: StatusOferta) {
  return status === "PENDENTE" || status === "EM_ESPERA";
}

export function statusOfertaValido(valor: string): StatusOferta | null {
  return (STATUS_OFERTA as readonly string[]).includes(valor) ? (valor as StatusOferta) : null;
}

export function precoOuNull(valor: number | null | undefined) {
  return valor != null && valor > 0 ? valor : null;
}

/** Preço anunciado do imóvel para o tipo da oferta. */
export function precoPedido(imovel: ImovelResumo, tipo: TipoOferta) {
  return precoOuNull(tipo === "VENDA" ? imovel.precoVenda : imovel.precoAluguel);
}
