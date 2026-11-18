import "server-only";

// A API Spring é chamada apenas do servidor (Server Components / Server Actions):
// evita CORS e não expõe a URL interna no bundle do navegador.
const API_URL = process.env.API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    /** Corpo da resposta de erro (a API manda text/plain em alguns casos, ex.: login 401). */
    public readonly body?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * Erros de validação de um `400` (ou conflito de estado de um `409`): objeto plano
   * `{ campo: mensagem }` (uma mensagem por campo; aninhados com ponto, ex.: `bairro.id`; corpo
   * malformado vem como `corpo`). `null` se não for um 400/409 nesse formato (o 409 de e-mail
   * repetido ainda vem em text/plain).
   */
  get validacao(): Record<string, string> | null {
    if ((this.status !== 400 && this.status !== 409) || !this.body) return null;
    try {
      const json: unknown = JSON.parse(this.body);
      if (!json || typeof json !== "object" || Array.isArray(json)) return null;
      // Corpo padrão do Spring (`timestamp`, `status`, `error`, `path`) não é validação. Hoje é o
      // que a API manda para JSON malformado, apesar de o contrato prometer `{ corpo: ... }`.
      if ("timestamp" in json && "status" in json) return null;
      const erros = Object.fromEntries(
        Object.entries(json).filter((e): e is [string, string] => typeof e[1] === "string" && e[1] !== ""),
      );
      return Object.keys(erros).length > 0 ? erros : null;
    } catch {
      return null;
    }
  }
}

/** Metadados de página da API (`page` começa em 0). */
export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface Page<T> {
  content: T[];
  page: PageMetadata;
}

/** Requisição crua: devolve a `Response` (para PDF e outros binários). Erro HTTP vira `ApiError`. */
export async function apiResposta(path: string, init?: RequestInit): Promise<Response> {
  return request(path, init);
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(`A API respondeu com erro ${res.status}.`, res.status, body || undefined);
  }
  return res;
}

/** Header de autenticação para as rotas protegidas. */
export function bearer(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function apiPostJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await request(path, {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await request(path, init);
  return res.json() as Promise<T>;
}

/** Envia JSON (POST/PUT). As mutações da API respondem sem corpo (201/204); devolve a Response. */
async function enviarJson(method: "POST" | "PUT", path: string, body: unknown, init?: RequestInit) {
  return request(path, {
    ...init,
    method,
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: JSON.stringify(body),
  });
}

/** POST com corpo JSON. A API responde sem corpo nas mutações, então não há retorno. */
export async function apiPost(path: string, body: unknown, init?: RequestInit): Promise<void> {
  await enviarJson("POST", path, body, init);
}

/** PUT com corpo JSON. Lembre: o PUT da API substitui o registro inteiro (omitido vira `null`). */
export async function apiPut(path: string, body: unknown, init?: RequestInit): Promise<void> {
  await enviarJson("PUT", path, body, init);
}

/** PATCH com corpo JSON que devolve o registro atualizado (ex.: status da oferta). */
export async function apiPatchJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await request(path, {
    ...init,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

/** POST sem corpo que devolve o registro atualizado (ações de status: cancelar, assinar). */
export async function apiPostAcao<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await request(path, { ...init, method: "POST" });
  return res.json() as Promise<T>;
}

/** POST multipart (upload). O fetch monta o `Content-Type` com o boundary. */
export async function apiPostForm(path: string, body: FormData, init?: RequestInit): Promise<void> {
  await request(path, { ...init, method: "POST", body });
}

export async function apiDelete(path: string, init?: RequestInit): Promise<void> {
  await request(path, { ...init, method: "DELETE" });
}

/** GET de recurso que a API responde `200` com corpo vazio quando não existe (bairro, tipo). */
export async function apiGetOuNull<T>(path: string, init?: RequestInit): Promise<T | null> {
  const res = await request(path, init);
  const texto = await res.text();
  return texto ? (JSON.parse(texto) as T) : null;
}

/** Máximo de itens por página aceito pela API (valores maiores são reduzidos para 100). */
export const TAMANHO_MAXIMO_API = 100;

/** Query de listagem paginada: `page` 0-based, `size` e `sort=campo,dir` (repetível). */
export function queryPagina(page: number, size: number, sort: string[] = []) {
  const qs = new URLSearchParams({ page: String(page), size: String(size) });
  for (const s of sort) qs.append("sort", s);
  return qs;
}

/** Todos os itens de uma listagem paginada (varre as páginas de 100). */
export async function listarTodasPaginas<T>(
  buscar: (page: number, size: number) => Promise<Page<T>>,
): Promise<T[]> {
  const todos: T[] = [];
  for (let page = 0; ; page++) {
    const resp = await buscar(page, TAMANHO_MAXIMO_API);
    todos.push(...resp.content);
    if (page >= resp.page.totalPages - 1) return todos;
  }
}

/** Fatia local de uma lista no formato `Page` da API (`pagina` 1-based). */
export function paginarLocal<T>(itens: T[], pagina: number, size: number): Page<T> {
  const inicio = (pagina - 1) * size;
  return {
    content: itens.slice(inicio, inicio + size),
    page: {
      size,
      number: pagina - 1,
      totalElements: itens.length,
      totalPages: Math.ceil(itens.length / size),
    },
  };
}
