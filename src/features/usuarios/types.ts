// Espelha os schemas `User`, `UserCreateInput` e `UserUpdateInput` da API (docs/openapi.yaml).
// O `User` em si é o mesmo do login (`Usuario` em features/auth/types.ts).

import type { Role, Usuario } from "@/features/auth/types";

export type { Role, Usuario };

/** POST /user. Sem `role` → a API cria como BASIC. */
export interface UsuarioCriacao {
  nome: string;
  email: string;
  senha: string;
  role: Role;
}

/**
 * PUT /user/{id}. `nome` e `email` sempre sobrescritos; `senha` só muda se vier não vazia;
 * `role` só muda se vier.
 */
export interface UsuarioAtualizacao {
  nome: string;
  email: string;
  senha?: string;
  role?: Role;
}

export const ROTULO_PERFIL: Record<Role, string> = { ADMIN: "Administrador", BASIC: "Cliente" };
