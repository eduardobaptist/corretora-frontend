import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, apiGet, apiPostJson, bearer } from "@/lib/api";
import { errosDaApi } from "@/lib/erros";
import { lerSessao } from "./session";
import type { Area, CadastroCampo, CadastroRequest, LoginResponse, Usuario } from "./types";
import { AREA_HREF, areaDoPapel } from "./utils";

/** Resultado de login/cadastro: o token, ou erros por campo (400/409) e/ou uma mensagem geral. */
export type ResultadoAuth<Campo extends string> =
  | { ok: true; token: string }
  | { ok: false; erros?: Partial<Record<Campo, string>>; mensagem?: string };

/** Falhas comuns a login e cadastro: 400 `{ campo: mensagem }` e API fora do ar. */
function falhaAuth<Campo extends string>(
  error: unknown,
  campos: readonly Campo[],
  acao: string,
): ResultadoAuth<Campo> {
  const daApi = errosDaApi(error, campos);
  if (daApi) {
    return {
      ok: false,
      erros: daApi.erros,
      mensagem: daApi.gerais.length > 0 ? daApi.gerais.join(" ") : undefined,
    };
  }
  if (error instanceof ApiError && error.status == null) {
    return { ok: false, mensagem: "Não foi possível conectar à API. Tente novamente em instantes." };
  }
  return { ok: false, mensagem: `Não foi possível ${acao} agora. Tente novamente em instantes.` };
}

/** POST /auth/login. 401 → corpo text/plain com a mensagem ("E-mail ou senha inválidos."). */
export async function autenticar(
  email: string,
  senha: string,
): Promise<ResultadoAuth<"email" | "senha">> {
  try {
    const { token } = await apiPostJson<LoginResponse>("/auth/login", { email, senha });
    return { ok: true, token };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { ok: false, mensagem: error.body?.trim() || "E-mail ou senha inválidos." };
    }
    return falhaAuth(error, ["email", "senha"], "entrar");
  }
}

/**
 * POST /auth/cadastro (público): cria um cliente (BASIC) e já devolve o token, como o login.
 * E-mail repetido → 409 (text/plain "E-mail já cadastrado."), mostrado no campo e-mail.
 */
export async function cadastrarCliente(dados: CadastroRequest): Promise<ResultadoAuth<CadastroCampo>> {
  try {
    const { token } = await apiPostJson<LoginResponse>("/auth/cadastro", dados);
    return { ok: true, token };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { ok: false, erros: { email: error.body?.trim() || "E-mail já cadastrado." } };
    }
    return falhaAuth(error, ["nome", "email", "senha"], "criar sua conta");
  }
}

/**
 * Usuário logado, confirmado na API (GET /auth/me). Sem sessão → login.
 * 401 (token expirado/inválido) ou 404 (usuário removido) → login com aviso de sessão expirada.
 * Deduplicado por request; chame dentro de <Suspense> (lê cookie).
 */
export const usuarioAtual = cache(async (destino?: string): Promise<Usuario> => {
  const sessao = await lerSessao();
  if (!sessao) redirect(urlLogin({ next: destino }));

  try {
    return await apiGet<Usuario>("/auth/me", { headers: bearer(sessao.token) });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      redirect(urlLogin({ motivo: "expirado", next: destino }));
    }
    throw error;
  }
});

/**
 * Checagem definitiva de acesso por papel: o papel vem da API (GET /auth/me), não do cookie.
 * Papel de outra área → redireciona para a área do usuário. Toda página/ação de área que
 * buscar ou alterar dados deve chamar isto antes (o proxy é só a checagem otimista).
 */
export async function exigirArea(area: Area): Promise<Usuario> {
  const usuario = await usuarioAtual(AREA_HREF[area]);
  const areaDoUsuario = areaDoPapel(usuario.role);
  if (areaDoUsuario !== area) {
    // Perfil trocado depois do login: o token (cookie) ainda tem o papel antigo e o proxy
    // mandaria de volta para cá (loop). Um novo login grava o token com o papel atual.
    const sessao = await lerSessao();
    if (sessao && areaDoPapel(sessao.role) === area) redirect(urlLogin({ motivo: "perfil" }));
    redirect(AREA_HREF[areaDoUsuario]);
  }
  return usuario;
}

/**
 * Chamada autenticada de uma área (páginas e Server Actions): confirma o papel na API, injeta o
 * header Bearer e trata 401 (token expirou no meio do caminho) mandando para o login.
 * `usuario` é o usuário logado (para regras como "não excluir a si mesmo").
 */
async function comoArea<T>(
  area: Area,
  fn: (auth: HeadersInit, usuario: Usuario) => Promise<T>,
): Promise<T> {
  const usuario = await exigirArea(area);
  const sessao = await lerSessao();
  if (!sessao) redirect(urlLogin({ next: AREA_HREF[area] }));

  try {
    return await fn(bearer(sessao.token), usuario);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(urlLogin({ motivo: "expirado", next: AREA_HREF[area] }));
    }
    throw error;
  }
}

/** Chamada autenticada de admin (ver `comoArea`). */
export function comoAdmin<T>(fn: (auth: HeadersInit, usuario: Usuario) => Promise<T>): Promise<T> {
  return comoArea("admin", fn);
}

/** Chamada autenticada de cliente: favoritos, ofertas e contratos do próprio usuário. */
export function comoCliente<T>(fn: (auth: HeadersInit, usuario: Usuario) => Promise<T>): Promise<T> {
  return comoArea("cliente", fn);
}

/**
 * Quem está vendo uma tela pública (vitrine, detalhe), só pelo cookie (otimista, sem chamar a
 * API): decide se mostra favoritar/fazer oferta. As ações conferem o papel de verdade.
 * Deduplicado por request; chame dentro de <Suspense> (lê cookie).
 */
export type Visitante =
  | { tipo: "anonimo" }
  | { tipo: "admin" }
  | { tipo: "cliente"; auth: HeadersInit };

export const visitanteAtual = cache(async (): Promise<Visitante> => {
  const sessao = await lerSessao();
  if (!sessao) return { tipo: "anonimo" };
  if (sessao.role === "ADMIN") return { tipo: "admin" };
  return { tipo: "cliente", auth: bearer(sessao.token) };
});

function urlLogin(params: { motivo?: string; next?: string }) {
  const qs = new URLSearchParams();
  if (params.motivo) qs.set("motivo", params.motivo);
  if (params.next) qs.set("next", params.next);
  return qs.size ? `/login?${qs}` : "/login";
}
