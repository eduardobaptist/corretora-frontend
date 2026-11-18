import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { FormState } from "./acoes";
import { ApiError } from "./api";

// Mensagens de falha das mutações: o que aconteceu + o que fazer (DESIGN.md §9).
// Use no `catch` das Server Actions: os helpers relançam os erros internos do Next
// (redirect para o login quando a sessão expira), que não podem ser engolidos.

export function mensagemDeErro(error: unknown, acao: string): string {
  unstable_rethrow(error);
  if (error instanceof ApiError) {
    if (error.status == null) return "Não foi possível conectar à API. Tente novamente em instantes.";
    const validacao = error.validacao;
    // 409: o status atual do registro não permite a ação; a mensagem da API já explica.
    if (validacao && error.status === 409) return Object.values(validacao).join(" ");
    if (validacao) return `Dados recusados pela API: ${Object.values(validacao).join(" ")}`;
    if (error.status === 403) return "Você não tem permissão para fazer isso.";
    if (error.status === 404) return "O registro não existe mais. Atualize a página.";
  }
  return `Não foi possível ${acao} agora. Tente novamente em instantes.`;
}

/**
 * Erros de validação (`400`/`409 { campo: mensagem }`) distribuídos entre os campos do formulário.
 * Chave aninhada usa a raiz (`bairro.id` → `bairro`). O que não for campo do formulário
 * (`corpo`, `id`, campo que a tela não mostra) vai para `gerais`. `null` se não for um 400.
 */
export function errosDaApi<Campo extends string>(
  error: unknown,
  campos: readonly Campo[],
): { erros: Partial<Record<Campo, string>>; gerais: string[] } | null {
  const validacao = error instanceof ApiError ? error.validacao : null;
  if (!validacao) return null;

  const erros: Partial<Record<Campo, string>> = {};
  const gerais: string[] = [];
  for (const [chave, mensagem] of Object.entries(validacao)) {
    const raiz = chave.split(".")[0] as Campo;
    if (campos.includes(raiz) && !erros[raiz]) erros[raiz] = mensagem;
    else gerais.push(mensagem);
  }
  return { erros, gerais };
}

/** Texto do Alert quando a API recusou campos: aponta para os destacados e lista o resto. */
export function resumoDaValidacao(erros: object, gerais: string[]): string {
  const destaque = Object.keys(erros).length > 0 ? "Confira os campos destacados." : "";
  return [destaque, ...gerais].filter(Boolean).join(" ");
}

/**
 * Falha de formulário (`FormState`): `400` vira erro em cada campo (com o texto da API);
 * o resto, mensagem geral via `mensagemDeErro`.
 */
export function falhaDeFormulario<Campo extends string>(
  error: unknown,
  acao: string,
  campos: readonly Campo[],
): FormState<Campo> {
  unstable_rethrow(error);
  const daApi = errosDaApi(error, campos);
  if (daApi) {
    return { status: "erro", erros: daApi.erros, mensagem: resumoDaValidacao(daApi.erros, daApi.gerais) };
  }
  return { status: "erro", mensagem: mensagemDeErro(error, acao) };
}

/**
 * Exclusão recusada. A API não trata vínculo (chave estrangeira): responde 500 quando o
 * registro ainda é usado por outro (ex.: bairro com imóveis).
 */
export function mensagemDeExclusao(error: unknown, vinculo: string): string {
  unstable_rethrow(error);
  if (error instanceof ApiError && error.status != null && error.status >= 500) {
    return `A API recusou a exclusão. Verifique se ainda há ${vinculo} vinculados e tente de novo.`;
  }
  return mensagemDeErro(error, "excluir");
}
