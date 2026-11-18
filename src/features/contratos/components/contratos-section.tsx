import { unstable_rethrow } from "next/navigation";
import { ListaErro, ListaToolbar, TabelaSkeleton } from "@/components/admin/lista-estados";
import { comoAdmin, comoCliente } from "@/features/auth/api";
import { ApiError, type Page } from "@/lib/api";
import { parseListaParams, TAMANHO_PAGINA_ADMIN } from "@/lib/lista";
import { listarContratos, listarMeusContratos } from "../api";
import { statusContratoValido, type Contrato } from "../types";
import { ContratosTabela, FiltroStatusContrato } from "./contratos-tabela";

const COLUNAS_ADMIN = ["Contrato", "Imóvel", "Cliente", "Negócio", "Situação", "Ações"];
const COLUNAS_CLIENTE = ["Imóvel", "Negócio", "Situação", "Datas", "Ações"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Contratos do admin (GET /contratos, todos) ou do cliente (GET /contratos/meus), com filtro de
 * status (`?status=`) feito pela API. O admin cancela; o cliente lê e assina.
 */
export async function ContratosSection({
  searchParams,
  area,
}: {
  searchParams: SearchParams;
  area: "admin" | "cliente";
}) {
  const params = parseListaParams(await searchParams);
  const status = statusContratoValido(params.status);
  const filtro = { page: params.pagina - 1, size: TAMANHO_PAGINA_ADMIN, status };

  let page: Page<Contrato>;
  try {
    page =
      area === "admin"
        ? await comoAdmin((auth) => listarContratos(auth, filtro))
        : await comoCliente((auth) => listarMeusContratos(auth, filtro));
  } catch (error) {
    unstable_rethrow(error);
    return (
      <div className="flex flex-col gap-4">
        <ListaToolbar>
          <FiltroStatusContrato valor={status} isDisabled />
        </ListaToolbar>
        <ListaErro
          titulo="Não foi possível carregar os contratos"
          mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
        />
      </div>
    );
  }

  return <ContratosTabela page={page} area={area} params={{ ...params, status: status ?? "" }} />;
}

export function ContratosSkeleton({ area }: { area: "admin" | "cliente" }) {
  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar>
        <FiltroStatusContrato valor={null} isDisabled />
      </ListaToolbar>
      <TabelaSkeleton colunas={area === "admin" ? COLUNAS_ADMIN : COLUNAS_CLIENTE} linhas={area === "admin" ? 8 : 4} />
    </div>
  );
}
