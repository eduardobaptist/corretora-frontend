import type { Role, TokenClaims } from "./types";

// Leitura do JWT da API, sem dependências de servidor: usada pela sessão (Server Components/
// Actions) e pelo proxy. O payload é só decodificado, não verificado: a assinatura é segredo
// do backend, e quem autoriza de verdade é a API (401/403).

export const COOKIE_SESSAO = "sessao";

export interface Sessao {
  token: string;
  id: number;
  nome: string;
  email: string;
  role: Role;
  /** epoch em segundos */
  expiraEm: number;
}

function decodificar(token: string): TokenClaims | null {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as TokenClaims;
  } catch {
    return null;
  }
}

/** Sessão a partir do token, ou `null` se ilegível ou expirado. */
export function sessaoDoToken(token: string | undefined | null): Sessao | null {
  if (!token) return null;
  const claims = decodificar(token);
  if (!claims || typeof claims.exp !== "number") return null;
  if (claims.exp * 1000 <= Date.now()) return null;
  return {
    token,
    id: claims.id,
    nome: claims.nome,
    email: claims.sub,
    role: claims.roles?.includes("ADMIN") ? "ADMIN" : "BASIC",
    expiraEm: claims.exp,
  };
}
