import { unstable_rethrow } from "next/navigation";
import { ListaErro, ListaToolbar, TabelaSkeleton } from "@/components/admin/lista-estados";
import { comoAdmin } from "@/features/auth/api";
import { contratoAtivoDaOferta } from "@/features/contratos/api";
import type { Contrato } from "@/features/contratos/types";
import { ApiError, type Page } from "@/lib/api";
import { parseListaParams, TAMANHO_PAGINA_ADMIN } from "@/lib/lista";
import { listarOfertas } from "../api";
import { statusOfertaValido, type Oferta } from "../types";
import { FiltroStatusOferta, OfertasTabela } from "./ofertas-tabela";

const COLUNAS = ["Imóvel", "Cliente", "Proposta", "Recebida em", "Situação", "Ações"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Todas as ofertas (GET /ofertas, admin), com filtro de status (`?status=`) feito pela API. */
export async function OfertasSection({ searchParams }: { searchParams: SearchParams }) {
  const params = parseListaParams(await searchParams);
  const status = statusOfertaValido(params.status);

  let dados: { page: Page<Oferta>; contratos: Record<number, Contrato | null> };
  try {
    dados = await comoAdmin(async (auth) => {
      const page = await listarOfertas(auth, { page: params.pagina - 1, size: TAMANHO_PAGINA_ADMIN, status });
      // Contrato ativo de cada oferta aceita da página: decide entre "Criar contrato" e "Ver contrato".
      const aceitas = page.content.filter((o) => o.status === "ACEITA");
      const ativos = await Promise.all(aceitas.map((o) => contratoAtivoDaOferta(auth, o.id)));
      return { page, contratos: Object.fromEntries(aceitas.map((o, i) => [o.id, ativos[i]])) };
    });
  } catch (error) {
    unstable_rethrow(error);
    return (
      <div className="flex flex-col gap-4">
        <ListaToolbar>
          <FiltroStatusOferta valor={status} isDisabled />
        </ListaToolbar>
        <ListaErro
          titulo="Não foi possível carregar as ofertas"
          mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
        />
      </div>
    );
  }

  return <OfertasTabela page={dados.page} contratos={dados.contratos} params={{ ...params, status: status ?? "" }} />;
}

export function OfertasSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar>
        <FiltroStatusOferta valor={null} isDisabled />
      </ListaToolbar>
      <TabelaSkeleton colunas={COLUNAS} />
    </div>
  );
}
