import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import {
  ApiError,
  apiGet,
  apiPost,
  listarTodasPaginas,
  queryPagina,
  type Page,
} from "@/lib/api";
import type { Imovel, ImovelSaberMais } from "./types";
import { filtrarImoveis, opcoesDeFiltro, ordenarImoveis, type OpcoesFiltro } from "./utils";
import {
  contarFiltros,
  ordenacaoDe,
  TAMANHO_PAGINA,
  type CampoOrdenacao,
  type Ordenacao,
  type VitrineParams,
} from "./vitrine-params";

/** Tag do cache da lista completa: as Server Actions do admin chamam `updateTag(TAG_IMOVEIS)`. */
export const TAG_IMOVEIS = "imoveis";
const CAMPOS_NULOS = new Set<CampoOrdenacao>(["precoVenda", "precoAluguel", "areaConstruida"]);

interface ListarImoveisQuery {
  /** 0-based, como na API */
  page: number;
  size: number;
  ordenacao?: Ordenacao;
}

/** Preço 0 no cadastro significa "não se aplica": trata como `null` para não exibir "R$ 0". */
export function normalizar(imovel: Imovel): Imovel {
  return {
    ...imovel,
    precoVenda: imovel.precoVenda && imovel.precoVenda > 0 ? imovel.precoVenda : null,
    precoAluguel: imovel.precoAluguel && imovel.precoAluguel > 0 ? imovel.precoAluguel : null,
    fotos: imovel.fotos ?? [],
  };
}

export async function listarImoveis({ page, size, ordenacao = [] }: ListarImoveisQuery) {
  const qs = queryPagina(
    page,
    size,
    ordenacao.map(([campo, dir]) => `${campo},${dir}`),
  );
  const resp = await apiGet<Page<Imovel>>(`/imoveis?${qs}`);
  return { ...resp, content: resp.content.map(normalizar) };
}

/**
 * Todos os imóveis (percorre as páginas de 100). Usado só para o que a API ainda não faz:
 * filtrar e montar as opções dos filtros. Cache curto para não varrer a API a cada request.
 */
export async function listarTodosImoveis(): Promise<Imovel[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_IMOVEIS);

  return listarTodasPaginas((page, size) => listarImoveis({ page, size }));
}

export interface ResultadoVitrine {
  pagina: Page<Imovel>;
  opcoes: OpcoesFiltro;
}

/**
 * Sem filtro: paginação e ordenação direto na API.
 * Com filtro (ou ordenação ascendente por campo que pode ser nulo, que a API põe no topo):
 * filtra, ordena e pagina localmente sobre a lista completa.
 */
export async function consultarVitrine(params: VitrineParams): Promise<ResultadoVitrine> {
  const ordenacao = ordenacaoDe(params.ordem, params.negocio);
  const local =
    contarFiltros(params) > 0 ||
    ordenacao.some(([campo, dir]) => dir === "asc" && CAMPOS_NULOS.has(campo));

  const todosPromise = listarTodosImoveis();

  if (!local) {
    const [pagina, todos] = await Promise.all([
      listarImoveis({ page: params.pagina - 1, size: TAMANHO_PAGINA, ordenacao }),
      todosPromise,
    ]);
    return { pagina, opcoes: opcoesDeFiltro(todos) };
  }

  const todos = await todosPromise;
  const resultado = ordenarImoveis(filtrarImoveis(todos, params), ordenacao);
  const inicio = (params.pagina - 1) * TAMANHO_PAGINA;
  return {
    pagina: {
      content: resultado.slice(inicio, inicio + TAMANHO_PAGINA),
      page: {
        size: TAMANHO_PAGINA,
        number: params.pagina - 1,
        totalElements: resultado.length,
        totalPages: Math.ceil(resultado.length / TAMANHO_PAGINA),
      },
    },
    opcoes: opcoesDeFiltro(todos),
  };
}

/** Imóvel por id, ou `null` se não existir. Deduplicado no request (metadata + página). */
export const buscarImovel = cache(async (id: string): Promise<Imovel | null> => {
  if (!/^\d+$/.test(id)) return null;
  try {
    return normalizar(await apiGet<Imovel>(`/imoveis/${id}`));
  } catch (error) {
    // 400 = id que não cabe no Long da API (`{ id: "Formato inválido." }`): também não existe.
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
});

export function enviarSaberMais(id: number, dados: ImovelSaberMais) {
  return apiPost(`/imoveis/sabermais/${id}`, dados);
}
