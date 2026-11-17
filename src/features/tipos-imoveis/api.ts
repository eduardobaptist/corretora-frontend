import "server-only";
import { apiDelete, apiGet, apiPost, apiPut, listarTodasPaginas, queryPagina, type Page } from "@/lib/api";
import type { TipoImovel, TipoImovelInput } from "./types";

// /tipos-imoveis exige login (qualquer papel). Todas recebem o header Bearer (`comoAdmin`).

export function listarTiposImovel(auth: HeadersInit, page: number, size: number) {
  return apiGet<Page<TipoImovel>>(`/tipos-imoveis?${queryPagina(page, size, ["nome,asc"])}`, {
    headers: auth,
  });
}

/** Todos os tipos (para o select do formulário de imóvel). */
export function listarTodosTiposImovel(auth: HeadersInit) {
  return listarTodasPaginas((page, size) => listarTiposImovel(auth, page, size));
}

/** 201 sem corpo (id só no header Location). */
export function criarTipoImovel(auth: HeadersInit, input: TipoImovelInput) {
  return apiPost("/tipos-imoveis", input, { headers: auth });
}

/** 204. Responde 204 mesmo se o id não existir. */
export function atualizarTipoImovel(auth: HeadersInit, id: number, input: TipoImovelInput) {
  return apiPut(`/tipos-imoveis/${id}`, input, { headers: auth });
}

/** 204. Tipo usado por imóveis → 500 (chave estrangeira; a API não trata). */
export function excluirTipoImovel(auth: HeadersInit, id: number) {
  return apiDelete(`/tipos-imoveis/${id}`, { headers: auth });
}
