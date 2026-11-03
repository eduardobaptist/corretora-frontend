const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const area = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export function formatCurrency(value: number) {
  return brl.format(value);
}

export function formatArea(value: number) {
  return `${area.format(value)} m²`;
}

/** Normaliza texto para busca: minúsculas e sem acentos. */
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
