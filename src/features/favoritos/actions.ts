"use server";

import { refresh } from "next/cache";
import { comoCliente } from "@/features/auth/api";
import type { ResultadoAcao } from "@/lib/acoes";
import { ApiError } from "@/lib/api";
import { mensagemDeErro } from "@/lib/erros";
import { desfavoritar, favoritar } from "./api";

/** Favorita (`true`) ou desfavorita (`false`). Os dois são idempotentes na API. */
export async function alternarFavorito(imovelId: number, favorito: boolean): Promise<ResultadoAcao> {
  try {
    await comoCliente((auth) => (favorito ? favoritar(auth, imovelId) : desfavoritar(auth, imovelId)));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { ok: false, mensagem: "Este imóvel não está mais disponível." };
    }
    return { ok: false, mensagem: mensagemDeErro(error, favorito ? "favoritar" : "remover dos favoritos") };
  }

  // Relê a tela: na lista de favoritos, o card some.
  refresh();
  return { ok: true, mensagem: favorito ? "Imóvel salvo nos favoritos." : "Imóvel removido dos favoritos." };
}
