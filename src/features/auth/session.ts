import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { COOKIE_SESSAO, sessaoDoToken, type Sessao } from "./token";

// Sessão = o próprio JWT da API num cookie httpOnly (o navegador nunca lê o token).

export type { Sessao };

/** Sessão atual ou `null` (sem cookie, token ilegível ou expirado). Lê cookie: fica em Suspense. */
export async function lerSessao(): Promise<Sessao | null> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  // A validade do token compara com Date.now(), que o Cache Components não deixa entrar no
  // prerender/prefetch. connection() marca a leitura como "só no request" (ela já é: depois
  // vem GET /auth/me sem cache).
  await connection();
  return sessaoDoToken(token);
}

/** Grava o token. Só em Server Actions/Route Handlers. Devolve a sessão ou `null` se inválido. */
export async function gravarSessao(token: string): Promise<Sessao | null> {
  const sessao = sessaoDoToken(token);
  if (!sessao) return null;
  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // O cookie morre junto com o token (não há refresh token na API).
    maxAge: Math.max(0, sessao.expiraEm - Math.floor(Date.now() / 1000)),
  });
  return sessao;
}

export async function apagarSessao() {
  (await cookies()).delete(COOKIE_SESSAO);
}
