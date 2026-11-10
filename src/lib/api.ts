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

/** POST com corpo JSON. A API responde sem corpo nas mutações, então não há retorno. */
export async function apiPost(path: string, body: unknown, init?: RequestInit): Promise<void> {
  await request(path, {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: JSON.stringify(body),
  });
}
