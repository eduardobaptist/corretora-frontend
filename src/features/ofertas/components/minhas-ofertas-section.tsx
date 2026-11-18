import { unstable_rethrow } from "next/navigation";
import { ListaErro, TabelaSkeleton } from "@/components/admin/lista-estados";
import { comoCliente } from "@/features/auth/api";
import { ApiError, type Page } from "@/lib/api";
import { parseListaParams, TAMANHO_PAGINA_ADMIN } from "@/lib/lista";
import { listarMinhasOfertas } from "../api";
import type { Oferta } from "../types";
import { MinhasOfertasTabela } from "./minhas-ofertas-tabela";

export const COLUNAS_MINHAS_OFERTAS = ["Imóvel", "Negócio", "Valor proposto", "Enviada em", "Situação", "Ações"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Ofertas do cliente logado (GET /ofertas/minhas), mais recentes primeiro. */
export async function MinhasOfertasSection({ searchParams }: { searchParams: SearchParams }) {
  const params = parseListaParams(await searchParams);

  let page: Page<Oferta>;
  try {
    page = await comoCliente((auth) =>
      listarMinhasOfertas(auth, { page: params.pagina - 1, size: TAMANHO_PAGINA_ADMIN }),
    );
  } catch (error) {
    unstable_rethrow(error);
    return (
      <ListaErro
        titulo="Não foi possível carregar suas ofertas"
        mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
      />
    );
  }

  return <MinhasOfertasTabela page={page} params={params} />;
}

export function MinhasOfertasSkeleton() {
  return <TabelaSkeleton colunas={COLUNAS_MINHAS_OFERTAS} linhas={4} />;
}
