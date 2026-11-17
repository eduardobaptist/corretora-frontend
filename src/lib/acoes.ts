// Contratos de retorno das Server Actions do admin (usados no servidor e no client).

/** Resultado de ação pontual (excluir, trocar perfil): o client mostra toast ou erro. */
export type ResultadoAcao = { ok: true; mensagem: string } | { ok: false; mensagem: string };

/** Estado de formulário (useActionState): erros por campo + mensagem geral. */
export interface FormState<Campo extends string = string> {
  status: "idle" | "sucesso" | "erro";
  mensagem?: string;
  erros?: Partial<Record<Campo, string>>;
}

export const FORM_INICIAL: FormState = { status: "idle" };

/** Texto do FormData, sem espaços nas pontas. */
export function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim();
}

/** Texto opcional: vazio vira `null` (o PUT da API grava `null` no que for omitido). */
export function textoOuNull(formData: FormData, campo: string) {
  return texto(formData, campo) || null;
}

/** Número opcional do FormData (o NumberField manda o valor cru, ex.: "450000.5"). */
export function numeroOuNull(formData: FormData, campo: string) {
  const valor = texto(formData, campo);
  if (!valor) return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

/** CEP: 8 dígitos → "00000-000". Vazio → `null`. Inválido → `undefined`. */
export function cepOuNull(valor: string): string | null | undefined {
  if (!valor) return null;
  const digitos = valor.replace(/\D/g, "");
  return digitos.length === 8 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : undefined;
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regras de validação da API (schemas `*Input`/`*Request` em docs/openapi.yaml). O front valida
// tudo antes de chamar a API; o 400 dela é a segunda linha de defesa (ver `falhaDeFormulario`).

/** Tamanho máximo das colunas de texto comuns (nome, e-mail, endereço…). */
export const MAX_TEXTO = 255;
/** Texto longo do imóvel (descrição, características). */
export const MAX_TEXTO_LONGO = 16000;
/** Mensagem do "saber mais". */
export const MAX_MENSAGEM = 2000;
export const SENHA_MIN = 6;
export const SENHA_MAX = 72;
export const MENSAGEM_SENHA = `A senha deve ter entre ${SENHA_MIN} e ${SENHA_MAX} caracteres.`;

/** `^\d{5}-\d{3}$`, o formato que a API exige (o front normaliza com `cepOuNull`). */
export const CEP = /^\d{5}-\d{3}$/;
/** Telefone do "saber mais": 8 a 20 caracteres entre dígitos, espaços, parênteses, + e -. */
export const TELEFONE = /^[0-9()+\- ]{8,20}$/;

export function senhaValida(senha: string) {
  return senha.length >= SENHA_MIN && senha.length <= SENHA_MAX;
}

/** Decimal no limite da coluna: até `inteiros` dígitos antes da vírgula e 2 casas depois. */
export function decimalValido(valor: number, inteiros: number) {
  return Math.abs(valor) < 10 ** inteiros && Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-6;
}

/**
 * Acumulador de erros por campo. Como na API, fica só a primeira regra que falhou em cada campo,
 * então declare as regras na ordem (obrigatório → formato → tamanho).
 */
export function validador<Campo extends string>() {
  const erros: Partial<Record<Campo, string>> = {};
  return {
    erros,
    /** Marca o erro se `falhou` e o campo ainda não tiver erro. */
    regra(campo: Campo, falhou: boolean, mensagem: string) {
      if (falhou && !erros[campo]) erros[campo] = mensagem;
    },
    /** `rotulo` no início da frase: "O nome deve ter no máximo 255 caracteres." */
    maximo(campo: Campo, valor: string | null | undefined, max: number, rotulo: string) {
      if (valor && valor.length > max && !erros[campo]) {
        erros[campo] = `${rotulo} deve ter no máximo ${max.toLocaleString("pt-BR")} caracteres.`;
      }
    },
    get temErros() {
      return Object.keys(erros).length > 0;
    },
  };
}
