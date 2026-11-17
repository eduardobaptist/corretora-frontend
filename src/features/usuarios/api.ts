import "server-only";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  listarTodasPaginas,
  paginarLocal,
  queryPagina,
  type Page,
} from "@/lib/api";
import { normalize } from "@/lib/format";
import type { ListaParams } from "@/lib/lista";
import type { Usuario, UsuarioAtualizacao, UsuarioCriacao } from "./types";

// /user/** exige ADMIN. Atenção às barras: listar é `GET /user/` (com barra), criar é `POST /user`.

export function listarUsuarios(auth: HeadersInit, page: number, size: number) {
  return apiGet<Page<Usuario>>(`/user/?${queryPagina(page, size, ["nome,asc"])}`, { headers: auth });
}

/**
 * Página de usuários. A API ainda não busca: com `q`, filtra localmente (nome ou e-mail, sem
 * acento/maiúscula) sobre a lista completa. Quando a API buscar, trocar por query param.
 */
export async function consultarUsuarios(auth: HeadersInit, { pagina, q }: ListaParams, size: number) {
  if (!q) return listarUsuarios(auth, pagina - 1, size);

  const termo = normalize(q);
  const todos = await listarTodasPaginas((page, s) => listarUsuarios(auth, page, s));
  const achados = todos.filter((u) => normalize(`${u.nome} ${u.email}`).includes(termo));
  return paginarLocal(achados, pagina, size);
}

export function buscarUsuario(auth: HeadersInit, id: number) {
  return apiGet<Usuario>(`/user/${id}`, { headers: auth });
}

/** 201 com o usuário. E-mail repetido → 409 (corpo text/plain "E-mail já cadastrado."). */
export function criarUsuario(auth: HeadersInit, input: UsuarioCriacao) {
  return apiPost("/user", input, { headers: auth });
}

/** 200 com o usuário. E-mail repetido → 409. */
export function atualizarUsuario(auth: HeadersInit, id: number, input: UsuarioAtualizacao) {
  return apiPut(`/user/${id}`, input, { headers: auth });
}

/** 204. A API não impede o admin de excluir a si mesmo: a regra fica nas actions. */
export function excluirUsuario(auth: HeadersInit, id: number) {
  return apiDelete(`/user/${id}`, { headers: auth });
}
