"use server";

import { redirect } from "next/navigation";
import {
  EMAIL,
  MAX_TEXTO,
  MENSAGEM_SENHA,
  senhaValida,
  texto,
  validador,
} from "@/lib/acoes";
import { autenticar, cadastrarCliente } from "./api";
import { apagarSessao, gravarSessao } from "./session";
import type { CadastroCampo, Role } from "./types";
import { AREA_HREF, areaDoPapel, destinoSeguro, podeAcessar } from "./utils";

/** Estado dos formulários de login e cadastro. */
export interface AuthState<Campo extends string> {
  erros?: Partial<Record<Campo, string>>;
  /** Erro geral (credenciais, API fora…), mostrado num Alert. */
  mensagem?: string;
  /** Valores para o formulário não perder o que foi digitado (nunca a senha). */
  valores?: Partial<Record<Exclude<Campo, "senha">, string>>;
}

export type LoginState = AuthState<"email" | "senha">;
export type CadastroState = AuthState<CadastroCampo>;

const TOKEN_INVALIDO = "A API devolveu um token inválido. Tente novamente.";

export async function entrar(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = texto(formData, "email");
  const senha = String(formData.get("senha") ?? "");
  const destino = destinoSeguro(String(formData.get("next") ?? ""));
  const valores = { email };

  // LoginRequest: só presença (a API responde 401 para credenciais erradas).
  const v = validador<"email" | "senha">();
  v.regra("email", !email, "Informe seu e-mail.");
  v.regra("email", !EMAIL.test(email), "Informe um e-mail válido.");
  v.regra("senha", !senha.trim(), "Informe sua senha.");
  if (v.temErros) return { erros: v.erros, valores };

  const resultado = await autenticar(email, senha);
  if (!resultado.ok) return { erros: resultado.erros, mensagem: resultado.mensagem, valores };

  const sessao = await gravarSessao(resultado.token);
  if (!sessao) return { mensagem: TOKEN_INVALIDO, valores };

  // redirect() lança: fica fora de try/catch.
  redirect(destinoDoPapel(sessao.role, destino));
}

/** Autocadastro de cliente: cria a conta (BASIC), grava a sessão e entra na área do cliente. */
export async function cadastrar(_prev: CadastroState, formData: FormData): Promise<CadastroState> {
  const nome = texto(formData, "nome");
  const email = texto(formData, "email").toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const destino = destinoSeguro(String(formData.get("next") ?? ""));
  const valores = { nome, email };

  // CadastroRequest: nome e e-mail obrigatórios (até 255), senha de 6 a 72 caracteres.
  // Senha só com espaços conta como ausente (a API faz o mesmo).
  const v = validador<CadastroCampo>();
  v.regra("nome", !nome, "Informe seu nome.");
  v.maximo("nome", nome, MAX_TEXTO, "O nome");
  v.regra("email", !email, "Informe seu e-mail.");
  v.regra("email", !EMAIL.test(email), "Informe um e-mail válido.");
  v.maximo("email", email, MAX_TEXTO, "O e-mail");
  v.regra("senha", !senha.trim(), "Crie uma senha.");
  v.regra("senha", !senhaValida(senha), MENSAGEM_SENHA);
  if (v.temErros) return { erros: v.erros, valores };

  const resultado = await cadastrarCliente({ nome, email, senha });
  if (!resultado.ok) return { erros: resultado.erros, mensagem: resultado.mensagem, valores };

  const sessao = await gravarSessao(resultado.token);
  if (!sessao) {
    // A conta já existe (cadastrar de novo daria 409): o caminho é o login.
    return { mensagem: "Sua conta foi criada, mas não conseguimos entrar. Use “Entrar” com o e-mail e a senha que você definiu.", valores };
  }

  redirect(destinoDoPapel(sessao.role, destino));
}

export async function sair() {
  await apagarSessao();
  redirect("/");
}

/** ?next= só vale se o papel puder abrir aquela rota (cliente não vai para /admin/...). */
function destinoDoPapel(role: Role, destino: string | null) {
  return destino && podeAcessar(role, destino) ? destino : AREA_HREF[areaDoPapel(role)];
}
