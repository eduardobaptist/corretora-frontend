import "server-only";
import { apiDelete, apiGet, apiPost, apiPut, listarTodasPaginas, queryPagina, type Page } from "@/lib/api";
import type { Bairro, BairroInput } from "./types";

// /bairros exige login (qualquer papel). Todas recebem o header Bearer (`comoAdmin`).

const ORDEM = ["cidade,asc", "nome,asc"];

export function listarBairros(auth: HeadersInit, page: number, size: number) {
  return apiGet<Page<Bairro>>(`/bairros?${queryPagina(page, size, ORDEM)}`, { headers: auth });
}

/** Todos os bairros (para o select do formulário de imóvel). */
export function listarTodosBairros(auth: HeadersInit) {
  return listarTodasPaginas((page, size) => listarBairros(auth, page, size));
}

/** 201 sem corpo (id só no header Location). */
export function criarBairro(auth: HeadersInit, input: BairroInput) {
  return apiPost("/bairros", input, { headers: auth });
}

/** 204. Responde 204 mesmo se o id não existir. */
export function atualizarBairro(auth: HeadersInit, id: number, input: BairroInput) {
  return apiPut(`/bairros/${id}`, input, { headers: auth });
}

/** 204. Bairro com imóveis → 500 (chave estrangeira; a API não trata). */
export function excluirBairro(auth: HeadersInit, id: number) {
  return apiDelete(`/bairros/${id}`, { headers: auth });
}
