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
import { listarBairros } from "../api";
import type { Bairro } from "../types";
import { BairrosTabela } from "./bairros-tabela";

const COLUNAS = ["Bairro", "Cidade", "Faixa de CEP", "Ações"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function BairrosSection({ searchParams }: { searchParams: SearchParams }) {
  const params = parseListaParams(await searchParams);

  let page: Page<Bairro>;
  try {
    page = await comoAdmin((auth) => listarBairros(auth, params.pagina - 1, TAMANHO_PAGINA_ADMIN));
  } catch (error) {
    unstable_rethrow(error);
    return (
      <div className="flex flex-col gap-4">
        <ListaToolbar acao={<BotaoNovoDesabilitado rotulo="Novo bairro" />} />
        <ListaErro
          titulo="Não foi possível carregar os bairros"
          mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
        />
      </div>
    );
  }

  return <BairrosTabela page={page} params={params} />;
}

export function BairrosSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar acao={<BotaoNovoDesabilitado rotulo="Novo bairro" />} />
      <TabelaSkeleton colunas={COLUNAS} />
    </div>
  );
}
