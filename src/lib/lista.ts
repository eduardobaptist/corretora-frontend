// Estado das listagens das áreas na URL: `?pagina=` (1-based), `?q=` (busca) e `?status=`
// (filtro de status, nas listas de ofertas e contratos; cada seção valida o valor).
// Isomórfico: o Server Component lê, os controles (client) navegam.

export const TAMANHO_PAGINA_ADMIN = 20;

export interface ListaParams {
  /** 1-based */
  pagina: number;
  q: string;
  /** vazio = todos */
  status: string;
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
    status: (primeiro(sp.status) ?? "").trim(),
  };
}

export function toListaSearchParams(params: Partial<ListaParams>) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  if (params.pagina && params.pagina > 1) qs.set("pagina", String(params.pagina));
  return qs;
}
