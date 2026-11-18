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

// Datas da API são `LocalDateTime` (ISO sem fuso, ex.: "2026-10-27T14:03:21.123456"). Montar a
// data com os componentes locais e formatar no fuso local mostra a mesma hora no servidor e no
// navegador (sem diferença de hidratação).
function dataLocal(iso: string) {
  const [data, hora = "00:00"] = iso.split("T");
  const [ano, mes, dia] = data.split("-").map(Number);
  const [h, min] = hora.split(":").map(Number);
  return new Date(ano, mes - 1, dia, h || 0, min || 0);
}

const dataCurta = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dataHoraCurta = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** "27/10/2026" */
export function formatData(iso: string) {
  return dataCurta.format(dataLocal(iso));
}

/** "27/10/2026, 14:03" */
export function formatDataHora(iso: string) {
  return dataHoraCurta.format(dataLocal(iso));
}
