"use server";

import { refresh, updateTag } from "next/cache";
import { comoAdmin, comoCliente } from "@/features/auth/api";
import { TAG_IMOVEIS } from "@/features/imoveis/api";
import type { FormState, ResultadoAcao } from "@/lib/acoes";
import { falhaDeFormulario, mensagemDeErro } from "@/lib/erros";
import { assinarContrato as assinarNaApi, cancelarContrato as cancelarNaApi, enviarContrato, gerarContrato } from "./api";
import type { ContratoGerarCampo } from "./types";
import { erroDoArquivo, lerContratoGerar, validarContratoGerar } from "./validacao";

const CAMPOS_GERAR: readonly ContratoGerarCampo[] = [
  "prazoMeses",
  "diaVencimento",
  "formaPagamento",
  "clausulasAdicionais",
];

/** Admin gera o contrato pelo modelo da API (POST /contratos com JSON). */
export async function criarContratoGerado(
  ofertaId: number,
  aluguel: boolean,
  _prev: FormState<ContratoGerarCampo>,
  formData: FormData,
): Promise<FormState<ContratoGerarCampo>> {
  const input = lerContratoGerar(formData, ofertaId, aluguel);
  const v = validarContratoGerar(input);
  if (v.temErros) return { status: "erro", erros: v.erros };

  try {
    await comoAdmin((auth) => gerarContrato(auth, input));
  } catch (error) {
    // 409 (oferta não aceita / já tem contrato ativo) vem em `ofertaId`: vai para o Alert.
    return falhaDeFormulario(error, "criar o contrato", CAMPOS_GERAR);
  }

  refresh();
  return { status: "sucesso", mensagem: "Contrato criado. O cliente já pode assinar." };
}

/** Admin envia um PDF pronto (POST /contratos multipart). */
export async function criarContratoEnviado(
  ofertaId: number,
  _prev: FormState<"arquivo">,
  formData: FormData,
): Promise<FormState<"arquivo">> {
  const valor = formData.get("arquivo");
  const arquivo = valor instanceof File ? valor : null;
  const erro = erroDoArquivo(arquivo);
  if (erro) return { status: "erro", erros: { arquivo: erro } };

  try {
    await comoAdmin((auth) => enviarContrato(auth, ofertaId, arquivo!, arquivo!.name));
  } catch (error) {
    return falhaDeFormulario(error, "enviar o contrato", ["arquivo"] as const);
  }

  refresh();
  return { status: "sucesso", mensagem: "Contrato enviado. O cliente já pode assinar." };
}

/**
 * Admin cancela um contrato ainda não assinado (desistência). A API cancela a oferta junto,
 * devolve o imóvel a disponível e as outras ofertas em espera a pendente.
 */
export async function cancelarContrato(id: number): Promise<ResultadoAcao> {
  try {
    await comoAdmin((auth) => cancelarNaApi(auth, id));
  } catch (error) {
    return { ok: false, mensagem: mensagemDeErro(error, "cancelar o contrato") };
  }
  updateTag(TAG_IMOVEIS);
  refresh();
  return { ok: true, mensagem: "Contrato e oferta cancelados. O imóvel voltou a ficar disponível." };
}

/** Cliente assina o próprio contrato. A API marca o imóvel como alugado/vendido. */
export async function assinarContrato(id: number): Promise<ResultadoAcao> {
  try {
    await comoCliente((auth) => assinarNaApi(auth, id));
  } catch (error) {
    return { ok: false, mensagem: mensagemDeErro(error, "assinar o contrato") };
  }
  updateTag(TAG_IMOVEIS);
  refresh();
  return { ok: true, mensagem: "Contrato assinado." };
}
