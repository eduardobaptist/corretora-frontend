import { unstable_rethrow } from "next/navigation";
import {
  BotaoNovoDesabilitado,
  ListaErro,
  ListaToolbar,
  TabelaSkeleton,
} from "@/components/admin/lista-estados";
import { BuscaCampo } from "@/components/admin/lista-navegacao";
import { comoAdmin } from "@/features/auth/api";
import { ApiError, type Page } from "@/lib/api";
import { parseListaParams, TAMANHO_PAGINA_ADMIN } from "@/lib/lista";
import { consultarUsuarios } from "../api";
import type { Usuario } from "../types";
import { UsuariosTabela } from "./usuarios-tabela";

const COLUNAS = ["Usuário", "E-mail", "Perfil", "Ações"];
const BUSCA = { label: "Buscar usuários", placeholder: "Buscar por nome ou e-mail…" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function UsuariosSection({ searchParams }: { searchParams: SearchParams }) {
  const params = parseListaParams(await searchParams);

  let dados: { page: Page<Usuario>; meuId: number };
  try {
    dados = await comoAdmin(async (auth, eu) => ({
      page: await consultarUsuarios(auth, params, TAMANHO_PAGINA_ADMIN),
      meuId: eu.id,
    }));
  } catch (error) {
    unstable_rethrow(error);
    return (
      <div className="flex flex-col gap-4">
        <ListaToolbar acao={<BotaoNovoDesabilitado rotulo="Novo usuário" />}>
          <BuscaCampo {...BUSCA} isDisabled />
        </ListaToolbar>
        <ListaErro
          titulo="Não foi possível carregar os usuários"
          mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
        />
      </div>
    );
  }

  return <UsuariosTabela page={dados.page} params={params} meuId={dados.meuId} />;
}

export function UsuariosSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar acao={<BotaoNovoDesabilitado rotulo="Novo usuário" />}>
        <BuscaCampo {...BUSCA} isDisabled />
      </ListaToolbar>
      <TabelaSkeleton colunas={COLUNAS} />
    </div>
  );
}
