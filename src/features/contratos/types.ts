// Espelha os schemas `Contrato` e `ContratoGerarInput` da API (docs/openapi.yaml).

import type { Oferta } from "@/features/ofertas/types";

export type StatusContrato = "AGUARDANDO_ASSINATURA" | "ASSINADO" | "CANCELADO";

/** `GERADO` = PDF montado pela API a partir do modelo; `UPLOAD` = PDF enviado pelo admin. */
export type OrigemContrato = "GERADO" | "UPLOAD";

export interface Contrato {
  id: number;
  oferta: Oferta;
  status: StatusContrato;
  origem: OrigemContrato;
  /** Nome do download: o original no upload; `contrato-oferta-{ofertaId}.pdf` no gerado. */
  nomeArquivo: string;
  /** GET /contratos/{id}/pdf: exige token. No navegador, use `hrefPdf` (Route Handler). */
  urlPdf: string;
  dataAprovacao: string;
  dataAssinatura: string | null;
  createdAt: string;
  updatedAt: string;
}

/** POST /contratos (JSON) e POST /contratos/previa. Prazo e vencimento só para aluguel. */
export interface ContratoGerarInput {
  ofertaId: number;
  prazoMeses: number | null;
  diaVencimento: number | null;
  formaPagamento: string | null;
  clausulasAdicionais: string | null;
}

export type ContratoGerarCampo = Exclude<keyof ContratoGerarInput, "ofertaId">;

export const STATUS_CONTRATO: readonly StatusContrato[] = ["AGUARDANDO_ASSINATURA", "ASSINADO", "CANCELADO"];

export const ROTULO_STATUS_CONTRATO: Record<StatusContrato, string> = {
  AGUARDANDO_ASSINATURA: "Aguardando assinatura",
  ASSINADO: "Assinado",
  CANCELADO: "Cancelado",
};

export const ROTULO_ORIGEM: Record<OrigemContrato, string> = { GERADO: "Gerado", UPLOAD: "Enviado" };

export function statusContratoValido(valor: string): StatusContrato | null {
  return (STATUS_CONTRATO as readonly string[]).includes(valor) ? (valor as StatusContrato) : null;
}

/**
 * PDF pelo Route Handler do Next (`src/app/api/contratos/[id]/pdf`), que repassa o token do
 * cookie: dá para usar direto em `<iframe>`/`<a>` (a `urlPdf` da API exige o header).
 */
export function hrefPdf(id: number, opcoes?: { baixar?: boolean }) {
  return `/api/contratos/${id}/pdf${opcoes?.baixar ? "?baixar=1" : ""}`;
}
