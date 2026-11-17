"use server";

import { refresh, updateTag } from "next/cache";
import { comoAdmin } from "@/features/auth/api";
import { TAG_IMOVEIS } from "@/features/imoveis/api";
import {
  cepOuNull,
  MAX_TEXTO,
  texto,
  validador,
  type FormState,
  type ResultadoAcao,
} from "@/lib/acoes";
import { falhaDeFormulario, mensagemDeExclusao } from "@/lib/erros";
import { atualizarBairro, criarBairro, excluirBairro as excluirNaApi } from "./api";
import { UFS, type BairroInput } from "./types";

export type BairroCampo = keyof BairroInput;

const CAMPOS: readonly BairroCampo[] = ["nome", "cidade", "estado", "cepInicial", "cepFinal"];

/** Cadastra (`id` null) ou edita um bairro. */
export async function salvarBairro(
  id: number | null,
  _prev: FormState<BairroCampo>,
  formData: FormData,
): Promise<FormState<BairroCampo>> {
  const cepInicial = cepOuNull(texto(formData, "cepInicial"));
  const cepFinal = cepOuNull(texto(formData, "cepFinal"));
  const estado = texto(formData, "estado").toUpperCase();

  // BairroInput: nome, cidade (até 255) e UF obrigatórios; CEPs opcionais no formato 00000-000.
  const v = validador<BairroCampo>();
  const nome = texto(formData, "nome");
  const cidade = texto(formData, "cidade");
  v.regra("nome", !nome, "Informe o nome do bairro.");
  v.maximo("nome", nome, MAX_TEXTO, "O nome");
  v.regra("cidade", !cidade, "Informe a cidade.");
  v.maximo("cidade", cidade, MAX_TEXTO, "A cidade");
  v.regra("estado", !(UFS as readonly string[]).includes(estado), "Escolha o estado.");
  v.regra("cepInicial", cepInicial === undefined, "Informe um CEP com 8 dígitos (00000-000).");
  v.regra("cepFinal", cepFinal === undefined, "Informe um CEP com 8 dígitos (00000-000).");
  v.regra(
    "cepFinal",
    !!cepInicial && !!cepFinal && cepInicial > cepFinal,
    "O CEP final deve ser maior que o inicial.",
  );
  if (v.temErros) return { status: "erro", erros: v.erros };

  const input: BairroInput = {
    nome,
    cidade,
    estado,
    cepInicial: cepInicial ?? null,
    cepFinal: cepFinal ?? null,
  };

  try {
    await comoAdmin((auth) => (id == null ? criarBairro(auth, input) : atualizarBairro(auth, id, input)));
  } catch (error) {
    return falhaDeFormulario(error, "salvar o bairro", CAMPOS);
  }

  // Imóveis trazem o bairro aninhado: a vitrine (cache de minutos) precisa refletir a mudança.
  updateTag(TAG_IMOVEIS);
  refresh();
  return { status: "sucesso", mensagem: id == null ? "Bairro cadastrado." : "Bairro atualizado." };
}

export async function excluirBairro(id: number): Promise<ResultadoAcao> {
  try {
    await comoAdmin((auth) => excluirNaApi(auth, id));
  } catch (error) {
    return { ok: false, mensagem: mensagemDeExclusao(error, "imóveis neste bairro") };
  }
  updateTag(TAG_IMOVEIS);
  refresh();
  return { ok: true, mensagem: "Bairro excluído." };
}
