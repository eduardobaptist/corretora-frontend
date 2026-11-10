// Espelha os schemas de auth/usuário da API (docs/openapi.yaml).

export type Role = "ADMIN" | "BASIC";

/** Schema `User` (GET /auth/me). */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

/** Schema `LoginResponse` (POST /auth/login). */
export interface LoginResponse {
  token: string;
}

/** Claims do JWT: `sub` (e-mail), `id`, `nome`, `roles`, `iss`, `iat`, `exp`. */
export interface TokenClaims {
  sub: string;
  id: number;
  nome: string;
  roles: string[];
  iss: string;
  iat: number;
  exp: number;
}

export type Area = "admin" | "cliente";
