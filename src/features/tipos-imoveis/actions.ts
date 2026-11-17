"use server";

import { refresh, updateTag } from "next/cache";
import { comoAdmin } from "@/features/auth/api";
import { TAG_IMOVEIS } from "@/features/imoveis/api";
import {
  MAX_TEXTO,
  texto,
  textoOuNull,
  validador,
  type FormState,
  type ResultadoAcao,
} from "@/lib/acoes";
import { falhaDeFormulario, mensagemDeExclusao } from "@/lib/erros";
import { atualizarTipoImovel, criarTipoImovel, excluirTipoImovel as excluirNaApi } from "./api";
import type { TipoImovelInput } from "./types";

export type TipoImovelCampo = keyof TipoImovelInput;

const CAMPOS: readonly TipoImovelCampo[] = ["nome", "descricao"];

/** Cadastra (`id` null) ou edita um tipo de imóvel. */
export async function salvarTipoImovel(
  id: number | null,
  _prev: FormState<TipoImovelCampo>,
  formData: FormData,
): Promise<FormState<TipoImovelCampo>> {
  const input: TipoImovelInput = {
    nome: texto(formData, "nome"),
    descricao: textoOuNull(formData, "descricao"),
  };
  // TipoImovelInput: nome obrigatório; nome e descrição com até 255 caracteres.
  const v = validador<TipoImovelCampo>();
  v.regra("nome", !input.nome, "Informe o nome do tipo.");
  v.maximo("nome", input.nome, MAX_TEXTO, "O nome");
  v.maximo("descricao", input.descricao, MAX_TEXTO, "A descrição");
  if (v.temErros) return { status: "erro", erros: v.erros };

  try {
    await comoAdmin((auth) =>
      id == null ? criarTipoImovel(auth, input) : atualizarTipoImovel(auth, id, input),
    );
  } catch (error) {
    return falhaDeFormulario(error, "salvar o tipo de imóvel", CAMPOS);
  }

  // Imóveis trazem o tipo aninhado: a vitrine (cache de minutos) precisa refletir a mudança.
  updateTag(TAG_IMOVEIS);
  refresh();
  return { status: "sucesso", mensagem: id == null ? "Tipo de imóvel cadastrado." : "Tipo de imóvel atualizado." };
}

export async function excluirTipoImovel(id: number): Promise<ResultadoAcao> {
  try {
    await comoAdmin((auth) => excluirNaApi(auth, id));
  } catch (error) {
    return { ok: false, mensagem: mensagemDeExclusao(error, "imóveis deste tipo") };
  }
  updateTag(TAG_IMOVEIS);
  refresh();
  return { ok: true, mensagem: "Tipo de imóvel excluído." };
}
