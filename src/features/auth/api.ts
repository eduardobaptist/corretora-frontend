import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, apiGet, apiPostJson, bearer } from "@/lib/api";
import { lerSessao } from "./session";
import type { Area, LoginResponse, Usuario } from "./types";
import { AREA_HREF, areaDoPapel } from "./utils";

export type ResultadoLogin =
  | { ok: true; token: string }
  | { ok: false; motivo: "credenciais" | "conexao" | "erro"; mensagem: string };

/** POST /auth/login. 401 → corpo text/plain com a mensagem ("E-mail ou senha inválidos."). */
export async function autenticar(email: string, senha: string): Promise<ResultadoLogin> {
  try {
    const { token } = await apiPostJson<LoginResponse>("/auth/login", { email, senha });
    return { ok: true, token };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return {
        ok: false,
        motivo: "credenciais",
        mensagem: error.body?.trim() || "E-mail ou senha inválidos.",
      };
    }
    if (error instanceof ApiError && error.status == null) {
      return { ok: false, motivo: "conexao", mensagem: error.message };
    }
    return {
      ok: false,
      motivo: "erro",
      mensagem: "Não foi possível entrar agora. Tente novamente em instantes.",
    };
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
  if (areaDoUsuario !== area) redirect(AREA_HREF[areaDoUsuario]);
  return usuario;
}

function urlLogin(params: { motivo?: string; next?: string }) {
  const qs = new URLSearchParams();
  if (params.motivo) qs.set("motivo", params.motivo);
  if (params.next) qs.set("next", params.next);
  return qs.size ? `/login?${qs}` : "/login";
}
