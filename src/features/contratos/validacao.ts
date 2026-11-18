// Regras do contrato compartilhadas entre a Server Action e o formulário (a prévia é montada no
// navegador, antes de chamar o Route Handler). Sem "server-only": roda nos dois lados.

import { validador } from "@/lib/acoes";
import type { ContratoGerarCampo, ContratoGerarInput } from "./types";

export const PRAZO_MIN = 1;
export const PRAZO_MAX = 360;
export const PRAZO_PADRAO = 30;
export const VENCIMENTO_MIN = 1;
export const VENCIMENTO_MAX = 28;
export const VENCIMENTO_PADRAO = 10;
export const MAX_FORMA_PAGAMENTO = 500;
export const MAX_CLAUSULAS = 4000;
export const FORMA_PAGAMENTO_PADRAO = "conforme acordado entre as partes";

/** Upload: PDF de até 10MB, nome com até 150 caracteres. */
export const MAX_ARQUIVO_BYTES = 10 * 1024 * 1024;
export const MAX_NOME_ARQUIVO = 150;

function textoOuNull(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim() || null;
}

function inteiroOuNull(formData: FormData, campo: string): number | null {
  const valor = String(formData.get(campo) ?? "").trim();
  if (!valor) return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : NaN;
}

/** Corpo de `ContratoGerarInput` a partir do formulário. Prazo e vencimento só no aluguel. */
export function lerContratoGerar(formData: FormData, ofertaId: number, aluguel: boolean): ContratoGerarInput {
  return {
    ofertaId,
    prazoMeses: aluguel ? inteiroOuNull(formData, "prazoMeses") : null,
    diaVencimento: aluguel ? inteiroOuNull(formData, "diaVencimento") : null,
    formaPagamento: textoOuNull(formData, "formaPagamento"),
    clausulasAdicionais: textoOuNull(formData, "clausulasAdicionais"),
  };
}

/** Mesmas regras de `ContratoGerarInput` (primeira que falha por campo). */
export function validarContratoGerar(input: ContratoGerarInput) {
  const v = validador<ContratoGerarCampo>();
  const { prazoMeses: prazo, diaVencimento: dia } = input;
  v.regra(
    "prazoMeses",
    prazo != null && (!Number.isInteger(prazo) || prazo < PRAZO_MIN || prazo > PRAZO_MAX),
    `O prazo deve ser de ${PRAZO_MIN} a ${PRAZO_MAX} meses.`,
  );
  v.regra(
    "diaVencimento",
    dia != null && (!Number.isInteger(dia) || dia < VENCIMENTO_MIN || dia > VENCIMENTO_MAX),
    `O dia de vencimento deve ser de ${VENCIMENTO_MIN} a ${VENCIMENTO_MAX}.`,
  );
  v.maximo("formaPagamento", input.formaPagamento, MAX_FORMA_PAGAMENTO, "A forma de pagamento");
  v.maximo("clausulasAdicionais", input.clausulasAdicionais, MAX_CLAUSULAS, "As cláusulas adicionais");
  return v;
}

/** Erro do arquivo de upload, ou `null` se estiver ok. */
export function erroDoArquivo(arquivo: File | null): string | null {
  if (!arquivo || arquivo.size === 0) return "Escolha o arquivo PDF do contrato.";
  if (!arquivo.name) return "O arquivo precisa ter um nome.";
  if (arquivo.name.length > MAX_NOME_ARQUIVO) {
    return `O nome do arquivo deve ter no máximo ${MAX_NOME_ARQUIVO} caracteres.`;
  }
  const pdf = arquivo.type === "application/pdf" || arquivo.name.toLowerCase().endsWith(".pdf");
  if (!pdf) return "Formato inválido. Envie um arquivo PDF.";
  if (arquivo.size > MAX_ARQUIVO_BYTES) return "O arquivo excede o tamanho máximo de 10MB.";
  return null;
}
