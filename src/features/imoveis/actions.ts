"use server";

import {
  EMAIL,
  MAX_MENSAGEM,
  MAX_TEXTO,
  TELEFONE,
  texto,
  textoOuNull,
  validador,
} from "@/lib/acoes";
import { ApiError } from "@/lib/api";
import { errosDaApi, resumoDaValidacao } from "@/lib/erros";
import { enviarSaberMais } from "./api";
import type { ImovelSaberMais } from "./types";

export type ContatoCampo = keyof ImovelSaberMais;

export interface ContatoState {
  status: "idle" | "sucesso" | "erro";
  mensagem?: string;
  erros?: Partial<Record<ContatoCampo, string>>;
  /** Valores enviados, para o form não perder o que foi digitado em caso de erro. */
  valores?: Partial<ImovelSaberMais>;
}

const CAMPOS: readonly ContatoCampo[] = ["nome", "email", "telefone", "mensagem"];

export async function enviarContato(
  imovelId: number,
  _prev: ContatoState,
  formData: FormData,
): Promise<ContatoState> {
  const valores: ImovelSaberMais = {
    nome: texto(formData, "nome"),
    email: texto(formData, "email"),
    telefone: textoOuNull(formData, "telefone"),
    mensagem: texto(formData, "mensagem"),
  };

  // ImovelSaberMais: nome e e-mail obrigatórios (até 255), mensagem obrigatória (até 2000),
  // telefone opcional (8 a 20 caracteres entre dígitos, espaços, parênteses, + e -).
  const v = validador<ContatoCampo>();
  v.regra("nome", !valores.nome, "Informe seu nome.");
  v.maximo("nome", valores.nome, MAX_TEXTO, "O nome");
  v.regra("email", !EMAIL.test(valores.email), "Informe um e-mail válido.");
  v.maximo("email", valores.email, MAX_TEXTO, "O e-mail");
  if (valores.telefone) {
    v.regra(
      "telefone",
      !TELEFONE.test(valores.telefone),
      "Use de 8 a 20 caracteres entre dígitos, espaços, parênteses, + e -.",
    );
    v.regra("telefone", valores.telefone.replace(/\D/g, "").length < 10, "Informe o telefone com DDD.");
  }
  v.regra("mensagem", !valores.mensagem, "Escreva uma mensagem.");
  v.maximo("mensagem", valores.mensagem, MAX_MENSAGEM, "A mensagem");

  if (v.temErros) {
    // Sem mensagem geral: os erros já aparecem em cada campo.
    return { status: "erro", erros: v.erros, valores };
  }

  try {
    await enviarSaberMais(imovelId, valores);
  } catch (error) {
    const daApi = errosDaApi(error, CAMPOS);
    if (daApi) {
      return {
        status: "erro",
        erros: daApi.erros,
        valores,
        mensagem: resumoDaValidacao(daApi.erros, daApi.gerais),
      };
    }
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: "erro",
        valores,
        mensagem: "Este imóvel não está mais disponível. Volte à vitrine para ver outras opções.",
      };
    }
    return {
      status: "erro",
      valores,
      mensagem: "Não foi possível enviar sua mensagem agora. Tente novamente em instantes.",
    };
  }

  return { status: "sucesso" };
}
