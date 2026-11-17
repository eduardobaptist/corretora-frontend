import { unstable_rethrow } from "next/navigation";
import {
  BotaoNovoDesabilitado,
  ListaErro,
  ListaToolbar,
  TabelaSkeleton,
} from "@/components/admin/lista-estados";
import { comoAdmin } from "@/features/auth/api";
import { ApiError, type Page } from "@/lib/api";
import { parseListaParams, TAMANHO_PAGINA_ADMIN } from "@/lib/lista";
import { listarTiposImovel } from "../api";
import type { TipoImovel } from "../types";
import { TiposImoveisTabela } from "./tipos-imoveis-tabela";

const COLUNAS = ["Tipo", "Descrição", "Ações"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function TiposImoveisSection({ searchParams }: { searchParams: SearchParams }) {
  const params = parseListaParams(await searchParams);

  let page: Page<TipoImovel>;
  try {
    page = await comoAdmin((auth) => listarTiposImovel(auth, params.pagina - 1, TAMANHO_PAGINA_ADMIN));
  } catch (error) {
    unstable_rethrow(error);
    return (
      <div className="flex flex-col gap-4">
        <ListaToolbar acao={<BotaoNovoDesabilitado rotulo="Novo tipo" />} />
        <ListaErro
          titulo="Não foi possível carregar os tipos de imóvel"
          mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
        />
      </div>
    );
  }

  return <TiposImoveisTabela page={page} params={params} />;
}

export function TiposImoveisSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar acao={<BotaoNovoDesabilitado rotulo="Novo tipo" />} />
      <TabelaSkeleton colunas={COLUNAS} />
    </div>
  );
}
