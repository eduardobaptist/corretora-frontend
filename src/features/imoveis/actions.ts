"use server";

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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function enviarContato(
  imovelId: number,
  _prev: ContatoState,
  formData: FormData,
): Promise<ContatoState> {
  const valores: ImovelSaberMais = {
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    telefone: String(formData.get("telefone") ?? "").trim(),
    mensagem: String(formData.get("mensagem") ?? "").trim(),
  };

  // A API devolve 500 se algum campo vier nulo: valida tudo antes de repassar.
  const erros: ContatoState["erros"] = {};
  if (!valores.nome) erros.nome = "Informe seu nome.";
  if (!EMAIL.test(valores.email)) erros.email = "Informe um e-mail válido.";
  if (valores.telefone.replace(/\D/g, "").length < 10)
    erros.telefone = "Informe um telefone com DDD.";
  if (!valores.mensagem) erros.mensagem = "Escreva uma mensagem.";

  if (Object.keys(erros).length > 0) {
    return { status: "erro", erros, valores, mensagem: "Confira os campos destacados." };
  }

  try {
    await enviarSaberMais(imovelId, valores);
  } catch {
    return {
      status: "erro",
      valores,
      mensagem: "Não foi possível enviar sua mensagem agora. Tente novamente em instantes.",
    };
  }

  return { status: "sucesso" };
}
