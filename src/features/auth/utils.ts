import type { Area, Role } from "./types";

export const AREA_HREF: Record<Area, string> = { admin: "/admin", cliente: "/cliente" };

export function areaDoPapel(role: Role): Area {
  return role === "ADMIN" ? "admin" : "cliente";
}

// Regra de acesso por papel (fonte única: usada pelo proxy, pelo login e pelas áreas).
// ADMIN só entra em /admin/**, BASIC só em /cliente/**; o resto do site é público.

/** Área a que a rota pertence, ou `null` se for pública. */
export function areaDaRota(pathname: string): Area | null {
  if (/^\/admin(\/|$)/.test(pathname)) return "admin";
  if (/^\/cliente(\/|$)/.test(pathname)) return "cliente";
  return null;
}

export function podeAcessar(role: Role, pathname: string): boolean {
  const area = areaDaRota(pathname);
  return area == null || area === areaDoPapel(role);
}

/** Só aceita caminhos internos ("/x"), nunca "//host" ou URLs absolutas (open redirect). */
export function destinoSeguro(destino: string | null | undefined): string | null {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//")) return null;
  return destino;
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const letras = partes.length > 1 ? partes[0][0] + partes.at(-1)![0] : (partes[0] ?? "?").slice(0, 2);
  return letras.toUpperCase();
}
