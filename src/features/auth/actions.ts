"use server";

import { redirect } from "next/navigation";
import { autenticar } from "./api";
import { apagarSessao, gravarSessao } from "./session";
import { AREA_HREF, areaDoPapel, destinoSeguro, podeAcessar } from "./utils";

export interface LoginState {
  erros?: Partial<Record<"email" | "senha", string>>;
  /** Erro geral (credenciais, API fora…), mostrado num Alert. */
  mensagem?: string;
  email?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function entrar(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const destino = destinoSeguro(String(formData.get("next") ?? ""));

  // LoginRequest: email (format: email) e senha obrigatórios.
  const erros: LoginState["erros"] = {};
  if (!email) erros.email = "Informe seu e-mail.";
  else if (!EMAIL.test(email)) erros.email = "Informe um e-mail válido.";
  if (!senha) erros.senha = "Informe sua senha.";
  if (Object.keys(erros).length > 0) return { erros, email };

  const resultado = await autenticar(email, senha);
  if (!resultado.ok) return { mensagem: resultado.mensagem, email };

  const sessao = await gravarSessao(resultado.token);
  if (!sessao) {
    return { mensagem: "A API devolveu um token inválido. Tente novamente.", email };
  }

  // ?next= só vale se o papel puder abrir aquela rota (cliente não volta para /admin/...).
  const inicio = AREA_HREF[areaDoPapel(sessao.role)];
  // redirect() lança: fica fora de try/catch.
  redirect(destino && podeAcessar(sessao.role, destino) ? destino : inicio);
}

export async function sair() {
  await apagarSessao();
  redirect("/");
}
