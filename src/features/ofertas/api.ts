import "server-only";
import { apiGet, apiPatchJson, apiPost, apiPostAcao, listarTodasPaginas, queryPagina, type Page } from "@/lib/api";
import type { DecisaoOferta, Oferta, OfertaInput, StatusOferta } from "./types";

// Cliente: cria, lista as suas e cancela (só em aberto). Admin: lista todas e decide o status.
// Oferta de outro usuário → 404 para quem não é admin. Conflito de status → 409 { campo: msg }.

interface FiltroOfertas {
  /** 0-based */
  page: number;
  size: number;
  status?: StatusOferta | null;
  imovelId?: number;
  usuarioId?: number;
}

function query({ page, size, status, imovelId, usuarioId }: FiltroOfertas) {
  // Mais recentes primeiro (id cresce com a criação).
  const qs = queryPagina(page, size, ["id,desc"]);
  if (status) qs.set("status", status);
  if (imovelId != null) qs.set("imovelId", String(imovelId));
  if (usuarioId != null) qs.set("usuarioId", String(usuarioId));
  return qs;
}

/** GET /ofertas (admin). */
export function listarOfertas(auth: HeadersInit, filtro: FiltroOfertas) {
  return apiGet<Page<Oferta>>(`/ofertas?${query(filtro)}`, { headers: auth });
}

/** GET /ofertas/minhas (usuário do token). */
export function listarMinhasOfertas(auth: HeadersInit, filtro: FiltroOfertas) {
  return apiGet<Page<Oferta>>(`/ofertas/minhas?${query(filtro)}`, { headers: auth });
}

/** 404 = não existe ou é de outro usuário. */
export function buscarOferta(auth: HeadersInit, id: number) {
  return apiGet<Oferta>(`/ofertas/${id}`, { headers: auth });
}

/**
 * Oferta em aberto (pendente ou em espera) do cliente para o imóvel, ou `null`. A API só filtra
 * por status em /ofertas/minhas: varre as duas listas (pequenas) e procura o imóvel.
 */
export async function ofertaEmAbertoDoImovel(auth: HeadersInit, imovelId: number): Promise<Oferta | null> {
  const listas = await Promise.all(
    (["PENDENTE", "EM_ESPERA"] as const).map((status) =>
      listarTodasPaginas((page, size) => listarMinhasOfertas(auth, { page, size, status })),
    ),
  );
  return listas.flat().find((o) => o.imovel.id === imovelId) ?? null;
}

/** 201 sem corpo. 409 = já há oferta em aberto para o imóvel. */
export function criarOferta(auth: HeadersInit, input: OfertaInput) {
  return apiPost("/ofertas", input, { headers: auth });
}

/** Só o dono, e só em aberto (409 se não). */
export function cancelarOferta(auth: HeadersInit, id: number) {
  return apiPostAcao<Oferta>(`/ofertas/${id}/cancelar`, { headers: auth });
}

/** Admin. Só a partir de PENDENTE/EM_ESPERA (409 se não). */
export function decidirOferta(auth: HeadersInit, id: number, status: DecisaoOferta) {
  return apiPatchJson<Oferta>(`/ofertas/${id}/status`, { status }, { headers: auth });
}
