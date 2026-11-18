import "server-only";
import { ApiError, apiDelete, apiGet, apiPut, listarTodasPaginas, queryPagina, type Page } from "@/lib/api";
import { normalizar } from "@/features/imoveis/api";
import type { Imovel } from "@/features/imoveis/types";

// /favoritos/** exige login e é sempre do próprio usuário (o do token). Idempotente:
// PUT favorita, DELETE desfavorita, ambos 204.

/** Página de imóveis favoritos (mesmo formato de GET /imoveis, com fotos). */
export async function listarFavoritos(auth: HeadersInit, page: number, size: number) {
  const resp = await apiGet<Page<Imovel>>(`/favoritos?${queryPagina(page, size, ["titulo,asc"])}`, {
    headers: auth,
  });
  return { ...resp, content: resp.content.map(normalizar) };
}

/** Ids de todos os favoritos (para marcar o coração nos cards da vitrine). */
export async function idsFavoritos(auth: HeadersInit): Promise<Set<number>> {
  const todos = await listarTodasPaginas((page, size) => listarFavoritos(auth, page, size));
  return new Set(todos.map((i) => i.id));
}

/** `false` também para imóvel inexistente. */
export async function ehFavorito(auth: HeadersInit, imovelId: number) {
  const { favorito } = await apiGet<{ favorito: boolean }>(`/favoritos/${imovelId}`, { headers: auth });
  return favorito;
}

/** 404 = imóvel não existe mais. */
export function favoritar(auth: HeadersInit, imovelId: number) {
  return apiPut(`/favoritos/${imovelId}`, undefined, { headers: auth });
}

export function desfavoritar(auth: HeadersInit, imovelId: number) {
  return apiDelete(`/favoritos/${imovelId}`, { headers: auth });
}

/**
 * Estado de favorito para as telas públicas. Falha da API (ou sessão que expirou) não derruba a
 * tela: devolve `null` e o coração some.
 */
export async function favoritosOuNull<T>(buscar: () => Promise<T>): Promise<T | null> {
  try {
    return await buscar();
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}
