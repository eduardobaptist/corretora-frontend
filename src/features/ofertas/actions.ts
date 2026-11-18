"use server";

import { refresh, updateTag } from "next/cache";
import { comoAdmin, comoCliente } from "@/features/auth/api";
import { TAG_IMOVEIS } from "@/features/imoveis/api";
import { decimalValido, numeroOuNull, textoOuNull, texto, validador, type FormState, type ResultadoAcao } from "@/lib/acoes";
import { falhaDeFormulario, mensagemDeErro } from "@/lib/erros";
import { formatCurrency } from "@/lib/format";
import { cancelarOferta as cancelarNaApi, criarOferta, decidirOferta as decidirNaApi } from "./api";
import {
  DIGITOS_VALOR_OFERTA,
  MAX_MENSAGEM_OFERTA,
  TIPOS_OFERTA,
  type DecisaoOferta,
  type OfertaCampo,
  type TipoOferta,
} from "./types";

const CAMPOS: readonly OfertaCampo[] = ["tipo", "valorProposto", "mensagem"];

/** Cliente faz uma oferta (POST /ofertas). Nasce PENDENTE. */
export async function fazerOferta(
  imovelId: number,
  _prev: FormState<OfertaCampo>,
  formData: FormData,
): Promise<FormState<OfertaCampo>> {
  const tipoBruto = texto(formData, "tipo");
  const tipo = (TIPOS_OFERTA as readonly string[]).includes(tipoBruto) ? (tipoBruto as TipoOferta) : null;
  const valorProposto = numeroOuNull(formData, "valorProposto");
  const mensagem = textoOuNull(formData, "mensagem");

  // OfertaInput: tipo obrigatório (ALUGUEL/VENDA); valor > 0 com até 13 dígitos inteiros e 2
  // casas; mensagem opcional até 2000.
  const v = validador<OfertaCampo>();
  v.regra("tipo", !tipo, "Escolha se a oferta é de compra ou de aluguel.");
  v.regra("valorProposto", valorProposto == null, "Informe o valor da oferta.");
  v.regra("valorProposto", valorProposto != null && valorProposto <= 0, "O valor deve ser maior que zero.");
  v.regra(
    "valorProposto",
    valorProposto != null && !decimalValido(valorProposto, DIGITOS_VALOR_OFERTA),
    "O valor deve ter até 13 dígitos inteiros e 2 casas decimais.",
  );
  v.maximo("mensagem", mensagem, MAX_MENSAGEM_OFERTA, "A mensagem");
  if (v.temErros) return { status: "erro", erros: v.erros };

  try {
    await comoCliente((auth) => criarOferta(auth, { imovelId, tipo: tipo!, valorProposto: valorProposto!, mensagem }));
  } catch (error) {
    // 409 (imóvel indisponível / já há oferta em aberto) e 400 de `imovelId` não são campos da
    // tela: vão para o Alert.
    return falhaDeFormulario(error, "enviar a oferta", CAMPOS);
  }

  refresh();
  return { status: "sucesso", mensagem: `Oferta de ${formatCurrency(valorProposto!)} enviada.` };
}

/** Cliente cancela a própria oferta (só pendente ou em espera). */
export async function cancelarOferta(id: number): Promise<ResultadoAcao> {
  try {
    await comoCliente((auth) => cancelarNaApi(auth, id));
  } catch (error) {
    return { ok: false, mensagem: mensagemDeErro(error, "cancelar a oferta") };
  }
  refresh();
  return { ok: true, mensagem: "Oferta cancelada." };
}

const MENSAGEM_DECISAO: Record<DecisaoOferta, string> = {
  ACEITA: "Oferta aceita. O imóvel ficou reservado.",
  EM_ESPERA: "Oferta colocada em espera.",
  RECUSADA: "Oferta recusada.",
};

/** Admin aceita, recusa ou coloca em espera. */
export async function decidirOferta(id: number, status: DecisaoOferta): Promise<ResultadoAcao> {
  if (!(status in MENSAGEM_DECISAO)) return { ok: false, mensagem: "Decisão inválida." };
  try {
    await comoAdmin((auth) => decidirNaApi(auth, id, status));
  } catch (error) {
    return { ok: false, mensagem: mensagemDeErro(error, "alterar a oferta") };
  }
  // Aceitar reserva o imóvel e põe as outras pendentes em espera: relê a lista e a vitrine.
  if (status === "ACEITA") updateTag(TAG_IMOVEIS);
  refresh();
  return { ok: true, mensagem: MENSAGEM_DECISAO[status] };
}
