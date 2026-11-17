import { unstable_rethrow } from "next/navigation";
import {
  BotaoNovoDesabilitado,
  ListaErro,
  ListaToolbar,
  TabelaSkeleton,
} from "@/components/admin/lista-estados";
import { exigirArea } from "@/features/auth/api";
import { ApiError, type Page } from "@/lib/api";
import { parseListaParams, TAMANHO_PAGINA_ADMIN } from "@/lib/lista";
import { listarImoveis } from "../../api";
import type { Imovel } from "../../types";
import { ImoveisTabela } from "./imoveis-tabela";

const COLUNAS = ["Imóvel", "Tipo", "Finalidade", "Status", "Preço", "Ações"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Lista do admin: paginada na API, mais recentes primeiro (GET /imoveis é público). */
export async function ImoveisAdminSection({ searchParams }: { searchParams: SearchParams }) {
  await exigirArea("admin");
  const params = parseListaParams(await searchParams);

  let page: Page<Imovel>;
  try {
    page = await listarImoveis({
      page: params.pagina - 1,
      size: TAMANHO_PAGINA_ADMIN,
      ordenacao: [["createdAt", "desc"]],
    });
  } catch (error) {
    unstable_rethrow(error);
    return (
      <div className="flex flex-col gap-4">
        <ListaToolbar acao={<BotaoNovoDesabilitado rotulo="Novo imóvel" />} />
        <ListaErro
          titulo="Não foi possível carregar os imóveis"
          mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
        />
      </div>
    );
  }

  return <ImoveisTabela page={page} params={params} />;
}

export function ImoveisAdminSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar acao={<BotaoNovoDesabilitado rotulo="Novo imóvel" />} />
      <TabelaSkeleton colunas={COLUNAS} />
    </div>
  );
}
