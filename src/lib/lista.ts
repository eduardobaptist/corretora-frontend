// Estado das listagens do admin na URL: `?pagina=` (1-based) e `?q=` (busca).
// Isomórfico: o Server Component lê, os controles (client) navegam.

export const TAMANHO_PAGINA_ADMIN = 20;

export interface ListaParams {
  /** 1-based */
  pagina: number;
  q: string;
}

type SearchParams = Record<string, string | string[] | undefined>;

function primeiro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export function parseListaParams(sp: SearchParams): ListaParams {
  const pagina = Number(primeiro(sp.pagina));
  return {
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
    q: (primeiro(sp.q) ?? "").trim(),
  };
}

export function toListaSearchParams(params: Partial<ListaParams>) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.pagina && params.pagina > 1) qs.set("pagina", String(params.pagina));
  return qs;
}
