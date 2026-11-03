import "server-only";

// A API Spring é chamada apenas do servidor (Server Components / Server Actions):
// evita CORS e não expõe a URL interna no bundle do navegador.
const API_URL = process.env.API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
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
    throw new ApiError(`A API respondeu com erro ${res.status}.`, res.status);
  }

  return res.json() as Promise<T>;
}
