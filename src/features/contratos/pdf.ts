import "server-only";
import { lerSessao } from "@/features/auth/session";
import { ApiError, apiResposta, bearer } from "@/lib/api";

// Ponte do navegador para os PDFs de contrato. A API exige `Authorization: Bearer`, mas o token
// fica no cookie httpOnly (o navegador nunca o vê) e a API não tem CORS: os Route Handlers em
// `app/api/contratos` repassam a chamada com o token da sessão e devolvem o PDF.

/** Faz a chamada com o token da sessão e devolve o PDF (ou o erro da API, no mesmo status). */
export async function repassarPdf(
  path: string,
  init: RequestInit,
  opcoes: { baixar?: boolean; exigirAdmin?: boolean } = {},
): Promise<Response> {
  const sessao = await lerSessao();
  if (!sessao) return texto("Sua sessão expirou. Entre de novo para ver o contrato.", 401);
  if (opcoes.exigirAdmin && sessao.role !== "ADMIN") return texto("Acesso restrito ao administrador.", 403);

  let res: Response;
  try {
    res = await apiResposta(path, {
      ...init,
      // O cliente HTTP manda `Accept: application/json` por padrão; aqui a resposta é o PDF
      // (e o JSON só nos erros).
      headers: { ...init.headers, Accept: "application/pdf, application/json", ...bearer(sessao.token) },
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status == null) return texto("Não foi possível conectar à API.", 502);
    if (error.status === 404) return texto("Contrato não encontrado.", 404);
    // 400 { campo: mensagem } (prévia) volta como JSON para o formulário mostrar nos campos.
    if (error.validacao) return Response.json(error.validacao, { status: error.status });
    return texto(`A API respondeu com erro ${error.status}.`, error.status);
  }

  const headers = new Headers({
    "Content-Type": res.headers.get("Content-Type") ?? "application/pdf",
    "Cache-Control": "private, no-store",
  });
  const disposicao = res.headers.get("Content-Disposition");
  if (disposicao) {
    headers.set("Content-Disposition", opcoes.baixar ? disposicao.replace(/^inline/i, "attachment") : disposicao);
  }
  return new Response(res.body, { status: 200, headers });
}

function texto(mensagem: string, status: number) {
  return new Response(mensagem, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
