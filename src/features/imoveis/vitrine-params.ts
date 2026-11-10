// Estado da vitrine na URL (?q=&negocio=&tipo=&cidade=&bairro=&dorm=&min=&max=&ordem=&pagina=).
// Isomórfico: usado pelo Server Component (searchParams) e pelos controles client.

export const TAMANHO_PAGINA = 12;

/**
 * A vitrine existe no site ("/") e dentro das áreas logadas ("/admin/vitrine",
 * "/cliente/vitrine"). `base` é o caminho da listagem; o detalhe fica logo abaixo dele.
 */
export function hrefImovel(base: string, id: number) {
  return base === "/" ? `/imoveis/${id}` : `${base}/${id}`;
}

export type Negocio = "comprar" | "alugar";

export interface FiltrosVitrine {
  q: string;
  negocio: Negocio | null;
  /** id do tipo de imóvel */
  tipo: string | null;
  /** "Cidade/UF" */
  cidade: string | null;
  /** id do bairro */
  bairro: string | null;
  /** mínimo de dormitórios */
  dormitorios: number | null;
  precoMin: number | null;
  precoMax: number | null;
}

export interface VitrineParams extends FiltrosVitrine {
  ordem: OrdemId;
  /** 1-based (a API começa em 0) */
  pagina: number;
}

type Direcao = "asc" | "desc";
export type CampoOrdenacao =
  | "destaque"
  | "createdAt"
  | "precoVenda"
  | "precoAluguel"
  | "areaConstruida";
export type Ordenacao = [CampoOrdenacao, Direcao][];

export const ORDENACOES = {
  destaques: "Destaques primeiro",
  recentes: "Mais recentes",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  "maior-area": "Maior área",
} as const;

export type OrdemId = keyof typeof ORDENACOES;
export const ORDEM_PADRAO: OrdemId = "destaques";

/** Traduz a ordem escolhida no `sort` da API. Preço segue o negócio (aluguel ou venda). */
export function ordenacaoDe(ordem: OrdemId, negocio: Negocio | null): Ordenacao {
  const preco: CampoOrdenacao = negocio === "alugar" ? "precoAluguel" : "precoVenda";
  switch (ordem) {
    case "recentes":
      return [["createdAt", "desc"]];
    case "menor-preco":
      return [[preco, "asc"]];
    case "maior-preco":
      return [[preco, "desc"]];
    case "maior-area":
      return [["areaConstruida", "desc"]];
    default:
      return [
        ["destaque", "desc"],
        ["createdAt", "desc"],
      ];
  }
}

type ParamsLike = URLSearchParams | Record<string, string | string[] | undefined>;

function ler(params: ParamsLike, chave: string): string | null {
  const valor = params instanceof URLSearchParams ? params.get(chave) : params[chave];
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto?.trim() ? texto.trim() : null;
}

function lerNumero(params: ParamsLike, chave: string): number | null {
  const texto = ler(params, chave);
  if (texto == null) return null;
  const n = Number(texto);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function parseVitrineParams(params: ParamsLike): VitrineParams {
  const negocio = ler(params, "negocio");
  const ordem = ler(params, "ordem");
  const pagina = Math.floor(lerNumero(params, "pagina") ?? 1);

  return {
    q: ler(params, "q") ?? "",
    negocio: negocio === "comprar" || negocio === "alugar" ? negocio : null,
    tipo: ler(params, "tipo"),
    cidade: ler(params, "cidade"),
    bairro: ler(params, "bairro"),
    dormitorios: lerNumero(params, "dorm"),
    precoMin: lerNumero(params, "min"),
    precoMax: lerNumero(params, "max"),
    ordem: ordem && ordem in ORDENACOES ? (ordem as OrdemId) : ORDEM_PADRAO,
    pagina: pagina >= 1 ? pagina : 1,
  };
}

/** Monta a query string a partir do estado, omitindo valores padrão. */
export function toSearchParams(p: VitrineParams): URLSearchParams {
  const sp = new URLSearchParams();
  const pares: [string, string | number | null][] = [
    ["q", p.q || null],
    ["negocio", p.negocio],
    ["tipo", p.tipo],
    ["cidade", p.cidade],
    ["bairro", p.bairro],
    ["dorm", p.dormitorios],
    ["min", p.precoMin],
    ["max", p.precoMax],
    ["ordem", p.ordem === ORDEM_PADRAO ? null : p.ordem],
    ["pagina", p.pagina > 1 ? p.pagina : null],
  ];
  for (const [chave, valor] of pares) {
    if (valor != null && valor !== "") sp.set(chave, String(valor));
  }
  return sp;
}

export function contarFiltros(f: FiltrosVitrine): number {
  return [
    f.q,
    f.negocio,
    f.tipo,
    f.cidade,
    f.bairro,
    f.dormitorios,
    f.precoMin,
    f.precoMax,
  ].filter((v) => v != null && v !== "").length;
}
