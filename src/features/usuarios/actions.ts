"use server";

import { refresh } from "next/cache";
import { comoAdmin } from "@/features/auth/api";
import {
  EMAIL,
  MAX_TEXTO,
  MENSAGEM_SENHA,
  senhaValida,
  texto,
  validador,
  type FormState,
  type ResultadoAcao,
} from "@/lib/acoes";
import { ApiError } from "@/lib/api";
import { falhaDeFormulario, mensagemDeErro } from "@/lib/erros";
import {
  atualizarUsuario,
  buscarUsuario,
  criarUsuario,
  excluirUsuario as excluirNaApi,
} from "./api";
import { ROTULO_PERFIL, type Role } from "./types";

export type UsuarioCampo = "nome" | "email" | "senha" | "role";

const CAMPOS: readonly UsuarioCampo[] = ["nome", "email", "senha", "role"];

// Regras do próprio admin (a API não impede): não se exclui nem troca o próprio perfil,
// senão perderia o acesso à área no meio da sessão.

function papel(valor: string): Role | null {
  return valor === "ADMIN" || valor === "BASIC" ? valor : null;
}

/** Cadastra (`id` null) ou edita um usuário. Senha vazia na edição mantém a atual. */
export async function salvarUsuario(
  id: number | null,
  _prev: FormState<UsuarioCampo>,
  formData: FormData,
): Promise<FormState<UsuarioCampo>> {
  const nome = texto(formData, "nome");
  const email = texto(formData, "email").toLowerCase();
  // Senha só com espaços conta como vazia (na edição, a API mantém a atual).
  const bruta = String(formData.get("senha") ?? "");
  const senha = bruta.trim() ? bruta : "";
  const role = papel(texto(formData, "role"));

  // UserCreateInput/UserUpdateInput: nome e e-mail obrigatórios (até 255); senha de 6 a 72
  // (obrigatória só no cadastro); perfil ADMIN ou BASIC.
  const v = validador<UsuarioCampo>();
  v.regra("nome", !nome, "Informe o nome.");
  v.maximo("nome", nome, MAX_TEXTO, "O nome");
  v.regra("email", !email, "Informe o e-mail.");
  v.regra("email", !EMAIL.test(email), "Informe um e-mail válido.");
  v.maximo("email", email, MAX_TEXTO, "O e-mail");
  v.regra("senha", id == null && !senha, "Defina uma senha.");
  v.regra("senha", !!senha && !senhaValida(senha), MENSAGEM_SENHA);
  v.regra("role", id == null && !role, "Escolha o perfil.");
  if (v.temErros) return { status: "erro", erros: v.erros };

  try {
    await comoAdmin((auth, eu) => {
      if (id == null) return criarUsuario(auth, { nome, email, senha, role: role! });
      // Próprio usuário: o perfil não vai no PUT (a API mantém o atual).
      const proprio = id === eu.id;
      return atualizarUsuario(auth, id, {
        nome,
        email,
        ...(senha ? { senha } : {}),
        ...(!proprio && role ? { role } : {}),
      });
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { status: "erro", erros: { email: error.body?.trim() || "E-mail já cadastrado." } };
    }
    return falhaDeFormulario(error, "salvar o usuário", CAMPOS);
  }

  refresh();
  return { status: "sucesso", mensagem: id == null ? "Usuário cadastrado." : "Usuário atualizado." };
}

/** Alterna o perfil (ADMIN ↔ BASIC). Lê nome/e-mail atuais na API: o PUT sempre os sobrescreve. */
export async function trocarPerfil(id: number): Promise<ResultadoAcao> {
  try {
    return await comoAdmin(async (auth, eu): Promise<ResultadoAcao> => {
      if (id === eu.id) return { ok: false, mensagem: "Você não pode trocar o próprio perfil." };
      const atual = await buscarUsuario(auth, id);
      const novo: Role = atual.role === "ADMIN" ? "BASIC" : "ADMIN";
      await atualizarUsuario(auth, id, { nome: atual.nome, email: atual.email, role: novo });
      refresh();
      return { ok: true, mensagem: `${atual.nome} agora é ${ROTULO_PERFIL[novo].toLowerCase()}.` };
    });
  } catch (error) {
    return { ok: false, mensagem: mensagemDeErro(error, "trocar o perfil") };
  }
}

export async function excluirUsuario(id: number): Promise<ResultadoAcao> {
  try {
    return await comoAdmin(async (auth, eu): Promise<ResultadoAcao> => {
      if (id === eu.id) return { ok: false, mensagem: "Você não pode excluir a si mesmo." };
      await excluirNaApi(auth, id);
      refresh();
      return { ok: true, mensagem: "Usuário excluído." };
    });
  } catch (error) {
    return { ok: false, mensagem: mensagemDeErro(error, "excluir o usuário") };
  }
}
