"use server";

import { refresh, updateTag } from "next/cache";
import { comoAdmin } from "@/features/auth/api";
import {
  cepOuNull,
  decimalValido,
  MAX_TEXTO,
  MAX_TEXTO_LONGO,
  numeroOuNull,
  texto,
  textoOuNull,
  validador,
  type FormState,
  type ResultadoAcao,
} from "@/lib/acoes";
import { falhaDeFormulario, mensagemDeExclusao } from "@/lib/erros";
import { TAG_IMOVEIS } from "../api";
import { statusImovelValido, type StatusImovel } from "../types";
import { atualizarImovel, criarImovel, excluirImovel as excluirNaApi } from "./api";
import type { ImovelCampo, ImovelInput } from "./types";

type Erros = NonNullable<FormState<ImovelCampo>["erros"]>;

const INTEIROS = ["dormitorios", "banheiros", "garagem"] as const;
/** Decimais e quantos dígitos inteiros a coluna aceita (todos com 2 casas). */
const DECIMAIS = { precoVenda: 13, precoAluguel: 13, areaTotal: 8, areaConstruida: 8 } as const;
type CampoNumerico = (typeof INTEIROS)[number] | keyof typeof DECIMAIS;

/** Textos com limite de tamanho e o rótulo usado na mensagem. */
const TEXTOS: [ImovelCampo, number, string][] = [
  ["titulo", MAX_TEXTO, "O título"],
  ["descricao", MAX_TEXTO_LONGO, "A descrição"],
  ["finalidade", MAX_TEXTO, "A finalidade"],
  ["endereco", MAX_TEXTO, "O endereço"],
  ["numero", MAX_TEXTO, "O número"],
  ["complemento", MAX_TEXTO, "O complemento"],
  ["caracteristicas", MAX_TEXTO_LONGO, "Os diferenciais"],
];

const CAMPOS: readonly ImovelCampo[] = [
  "titulo", "descricao", "precoVenda", "precoAluguel", "finalidade", "status", "dormitorios",
  "banheiros", "garagem", "areaTotal", "areaConstruida", "endereco", "numero", "complemento",
  "cep", "caracteristicas", "destaque", "tipoImovel", "bairro",
];

function idRef(formData: FormData, campo: string) {
  const id = Number(texto(formData, campo));
  return Number.isInteger(id) && id > 0 ? { id } : null;
}

/**
 * Lê e valida o formulário com as regras do `ImovelInput` (a API só exige o título; finalidade,
 * status e endereço são obrigatórios por regra do front). Devolve o corpo do POST/PUT ou os erros.
 */
function lerImovel(formData: FormData): { input: ImovelInput } | { erros: Erros } {
  const v = validador<ImovelCampo>();
  const numeros = {} as Record<CampoNumerico, number | null>;

  for (const campo of INTEIROS) {
    const valor = numeroOuNull(formData, campo);
    v.regra(campo, valor != null && valor < 0, "Não pode ser negativo.");
    v.regra(campo, valor != null && !Number.isInteger(valor), "Use um número inteiro.");
    numeros[campo] = valor;
  }
  for (const [campo, inteiros] of Object.entries(DECIMAIS) as [keyof typeof DECIMAIS, number][]) {
    const valor = numeroOuNull(formData, campo);
    v.regra(campo, valor != null && valor < 0, "Não pode ser negativo.");
    v.regra(
      campo,
      valor != null && !decimalValido(valor, inteiros),
      `Use até ${inteiros} dígitos antes da vírgula e 2 casas decimais.`,
    );
    numeros[campo] = valor;
  }

  const cep = cepOuNull(texto(formData, "cep"));
  v.regra("cep", cep === undefined, "Informe um CEP com 8 dígitos (00000-000).");

  const input: ImovelInput = {
    titulo: texto(formData, "titulo"),
    descricao: textoOuNull(formData, "descricao"),
    finalidade: texto(formData, "finalidade"),
    // Enum na API (texto livre antigo → 400). Inválido fica vazio e cai na regra abaixo.
    status: statusImovelValido(texto(formData, "status")) as StatusImovel,
    endereco: texto(formData, "endereco"),
    numero: textoOuNull(formData, "numero"),
    complemento: textoOuNull(formData, "complemento"),
    cep: cep ?? null,
    // Normaliza a lista: "a,b , ,c" → "a, b, c"
    caracteristicas:
      texto(formData, "caracteristicas")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .join(", ") || null,
    // Preço 0 significa "não se aplica" nos cadastros antigos: grava `null`.
    precoVenda: numeros.precoVenda || null,
    precoAluguel: numeros.precoAluguel || null,
    dormitorios: numeros.dormitorios,
    banheiros: numeros.banheiros,
    garagem: numeros.garagem,
    areaTotal: numeros.areaTotal,
    areaConstruida: numeros.areaConstruida,
    destaque: formData.get("destaque") != null,
    tipoImovel: idRef(formData, "tipoImovel"),
    bairro: idRef(formData, "bairro"),
  };

  v.regra("titulo", !input.titulo, "Informe o título do anúncio.");
  v.regra("finalidade", !input.finalidade, "Informe a finalidade.");
  v.regra("status", !input.status, "Escolha o status.");
  v.regra("endereco", !input.endereco, "Informe o endereço.");
  for (const [campo, max, rotulo] of TEXTOS) {
    v.maximo(campo, input[campo] as string | null, max, rotulo);
  }

  return v.temErros ? { erros: v.erros } : { input };
}

/** Cadastra (`id` null) ou edita um imóvel. No sucesso, o client volta para a lista. */
export async function salvarImovel(
  id: number | null,
  _prev: FormState<ImovelCampo>,
  formData: FormData,
): Promise<FormState<ImovelCampo>> {
  const lido = lerImovel(formData);
  if ("erros" in lido) {
    return { status: "erro", erros: lido.erros, mensagem: "Confira os campos destacados." };
  }

  try {
    await comoAdmin((auth) =>
      id == null ? criarImovel(auth, lido.input) : atualizarImovel(auth, id, lido.input),
    );
  } catch (error) {
    return falhaDeFormulario(error, "salvar o imóvel", CAMPOS);
  }

  updateTag(TAG_IMOVEIS);
  return { status: "sucesso", mensagem: id == null ? "Imóvel cadastrado." : "Imóvel atualizado." };
}

export async function excluirImovel(id: number): Promise<ResultadoAcao> {
  try {
    await comoAdmin((auth) => excluirNaApi(auth, id));
  } catch (error) {
    return { ok: false, mensagem: mensagemDeExclusao(error, "fotos ou outros registros") };
  }
  updateTag(TAG_IMOVEIS);
  refresh();
  return { ok: true, mensagem: "Imóvel excluído." };
}
