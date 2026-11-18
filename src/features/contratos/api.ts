import "server-only";
import { apiGet, apiPost, apiPostAcao, apiPostForm, queryPagina, type Page } from "@/lib/api";
import type { Contrato, ContratoGerarInput, StatusContrato } from "./types";

// Admin cria (gerando o PDF ou enviando um pronto), lista todos e cancela os não assinados.
// Cliente lista os seus e assina. Contrato de outro usuário → 404 para quem não é admin.
// O PDF exige token: o navegador baixa pelo Route Handler (`hrefPdf`), que usa `apiResposta`.

interface FiltroContratos {
  /** 0-based */
  page: number;
  size: number;
  status?: StatusContrato | null;
  ofertaId?: number;
}

function query({ page, size, status, ofertaId }: FiltroContratos) {
  const qs = queryPagina(page, size, ["id,desc"]);
  if (status) qs.set("status", status);
  if (ofertaId != null) qs.set("ofertaId", String(ofertaId));
  return qs;
}

/** GET /contratos (admin). Com `ofertaId`, todos os da oferta (inclusive cancelados). */
export function listarContratos(auth: HeadersInit, filtro: FiltroContratos) {
  return apiGet<Page<Contrato>>(`/contratos?${query(filtro)}`, { headers: auth });
}

/** GET /contratos/meus (contratos das ofertas do usuário do token). */
export function listarMeusContratos(auth: HeadersInit, filtro: FiltroContratos) {
  return apiGet<Page<Contrato>>(`/contratos/meus?${query(filtro)}`, { headers: auth });
}

/** Contrato aguardando assinatura ou assinado da oferta, ou `null`. */
export async function contratoAtivoDaOferta(auth: HeadersInit, ofertaId: number): Promise<Contrato | null> {
  const { content } = await listarContratos(auth, { page: 0, size: 100, ofertaId });
  return content.find((c) => c.status !== "CANCELADO") ?? null;
}

/** Forma "gerar": a API monta o PDF. 201 sem corpo. */
export function gerarContrato(auth: HeadersInit, input: ContratoGerarInput) {
  return apiPost("/contratos", input, { headers: auth });
}

/** Forma "upload": multipart com `arquivo` (PDF) + `ofertaId`. 201 sem corpo. */
export function enviarContrato(auth: HeadersInit, ofertaId: number, arquivo: Blob, nome: string) {
  const corpo = new FormData();
  // A API exige o Content-Type da parte = application/pdf.
  corpo.append("arquivo", new Blob([arquivo], { type: "application/pdf" }), nome);
  corpo.append("ofertaId", String(ofertaId));
  return apiPostForm("/contratos", corpo, { headers: auth });
}

/** Admin, só aguardando assinatura (409 se não). A oferta continua aceita. */
export function cancelarContrato(auth: HeadersInit, id: number) {
  return apiPostAcao<Contrato>(`/contratos/${id}/cancelar`, { headers: auth });
}

/** Só o cliente da oferta (404 para outros, inclusive o admin), só aguardando (409 se não). */
export function assinarContrato(auth: HeadersInit, id: number) {
  return apiPostAcao<Contrato>(`/contratos/${id}/assinar`, { headers: auth });
}
