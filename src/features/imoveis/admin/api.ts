import "server-only";
import { apiDelete, apiPost, apiPut } from "@/lib/api";
import type { ImovelInput } from "./types";

// Escrita em /imoveis exige ADMIN (header Bearer via `comoAdmin`). A leitura é pública:
// a listagem e o detalhe reaproveitam `listarImoveis`/`buscarImovel` de ../api.ts.

/** 201 sem corpo (id só no header Location). */
export function criarImovel(auth: HeadersInit, input: ImovelInput) {
  return apiPost("/imoveis", input, { headers: auth });
}

/** 204; 404 se não existir. Substitui o registro inteiro. */
export function atualizarImovel(auth: HeadersInit, id: number, input: ImovelInput) {
  return apiPut(`/imoveis/${id}`, input, { headers: auth });
}

/** 204. Imóvel com fotos pode dar 500 (chave estrangeira; a API não trata). */
export function excluirImovel(auth: HeadersInit, id: number) {
  return apiDelete(`/imoveis/${id}`, { headers: auth });
}
