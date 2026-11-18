import "server-only";
import { listarContratos } from "@/features/contratos/api";
import { listarTodosImoveis } from "@/features/imoveis/api";
import { STATUS_IMOVEL, type Imovel, type StatusImovel } from "@/features/imoveis/types";
import { listarOfertas } from "@/features/ofertas/api";
import { ROTULO_STATUS_OFERTA, STATUS_OFERTA, type StatusOferta } from "@/features/ofertas/types";
import { normalize } from "@/lib/format";
import type { ItemGrafico } from "./types";

// Números do painel do admin. A API não tem endpoint de estatística:
// - contagens de ofertas e contratos = `totalElements` de uma página de 1 item filtrada por status
//   (o filtro é da API, então custa uma chamada leve por status);
// - agrupamentos de imóveis = sobre a lista completa (`listarTodosImoveis`, já em cache curto).

/** Bairros mostrados um a um; o resto vira "Outros" (mais barras não se leem num card). */
const MAX_BAIRROS = 7;

const COR_NEUTRA = "var(--grafico-neutro)";

/**
 * Pinta as barras na ordem da tela com a paleta categórica (1→8, a ordem validada para vizinhos);
 * os itens neutros ("Outros", "Sem bairro", "Não informada") ficam cinza e não gastam cor.
 * A cor segue a posição, não o item: cada bairro/finalidade só aparece neste gráfico, sem filtro
 * que o repinte, e assim dois vizinhos nunca caem num par de cores que se confunde.
 */
function colorir(itens: ItemGrafico[], neutro: (i: ItemGrafico) => boolean): ItemGrafico[] {
  let slot = 0;
  return itens.map((i) => ({ ...i, cor: neutro(i) ? COR_NEUTRA : `var(--grafico-${(slot++ % 8) + 1})` }));
}

/**
 * Situação da oferta → cor fixa (a ordem do fluxo também é fixa na tela). Cores da paleta com
 * sentido: pendente azul, em espera amarelo, aceita aqua, recusada vermelho, cancelada cinza.
 * Validado como vizinhos nos dois modos; o par aceita/recusada fica na faixa 6–8 de daltonismo, o
 * que pede codificação extra: nome sob cada coluna e valor em cada barra.
 */
const COR_STATUS_OFERTA: Record<StatusOferta, string> = {
  PENDENTE: "var(--grafico-1)",
  EM_ESPERA: "var(--grafico-4)",
  ACEITA: "var(--grafico-3)",
  RECUSADA: "var(--grafico-8)",
  CANCELADA: COR_NEUTRA,
};

export interface DadosPainel {
  imoveis: {
    total: number;
    porStatus: Record<StatusImovel, number>;
    porBairro: ItemGrafico[];
    porFinalidade: ItemGrafico[];
  };
  ofertas: { total: number; contagem: Record<StatusOferta, number>; porStatus: ItemGrafico[] };
  contratos: { aguardando: number; assinados: number };
}

async function contar(buscar: () => Promise<{ page: { totalElements: number } }>) {
  return (await buscar()).page.totalElements;
}

function porBairro(imoveis: Imovel[]): ItemGrafico[] {
  const grupos = new Map<string, ItemGrafico>();
  for (const imovel of imoveis) {
    const b = imovel.bairro;
    const chave = b ? String(b.id) : "sem";
    const atual = grupos.get(chave) ?? {
      rotulo: b ? b.nome : "Sem bairro",
      detalhe: b ? `${b.cidade}/${b.estado}` : undefined,
      valor: 0,
      href: b ? `/admin/vitrine?bairro=${b.id}` : undefined,
    };
    atual.valor++;
    grupos.set(chave, atual);
  }
  const ordenados = [...grupos.values()].sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo, "pt-BR"));
  const semCor = (i: ItemGrafico) => !i.href; // "Sem bairro" e "Outros" não levam a uma lista
  if (ordenados.length <= MAX_BAIRROS + 1) return colorir(ordenados, semCor);
  const resto = ordenados.slice(MAX_BAIRROS);
  return colorir(
    [
      ...ordenados.slice(0, MAX_BAIRROS),
      {
        rotulo: "Outros",
        detalhe: `${resto.length} bairros`,
        valor: resto.reduce((soma, i) => soma + i.valor, 0),
      },
    ],
    semCor,
  );
}

/** Finalidade é texto livre: agrupa sem acento/maiúscula e mostra a grafia mais comum. */
function porFinalidade(imoveis: Imovel[]): ItemGrafico[] {
  const grupos = new Map<string, { grafias: Map<string, number>; valor: number }>();
  for (const imovel of imoveis) {
    const texto = imovel.finalidade?.trim() || "Não informada";
    const chave = normalize(texto);
    const g = grupos.get(chave) ?? { grafias: new Map(), valor: 0 };
    g.valor++;
    g.grafias.set(texto, (g.grafias.get(texto) ?? 0) + 1);
    grupos.set(chave, g);
  }
  const itens = [...grupos.values()]
    .map((g) => ({
      rotulo: [...g.grafias.entries()].sort((a, b) => b[1] - a[1])[0][0],
      valor: g.valor,
    }))
    .sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo, "pt-BR"));
  return colorir(itens, (i) => i.rotulo === "Não informada");
}

export async function carregarPainel(auth: HeadersInit): Promise<DadosPainel> {
  const [imoveis, contagensOfertas, aguardando, assinados] = await Promise.all([
    listarTodosImoveis(),
    Promise.all(
      STATUS_OFERTA.map((status) => contar(() => listarOfertas(auth, { page: 0, size: 1, status }))),
    ),
    contar(() => listarContratos(auth, { page: 0, size: 1, status: "AGUARDANDO_ASSINATURA" })),
    contar(() => listarContratos(auth, { page: 0, size: 1, status: "ASSINADO" })),
  ]);

  const porStatus: ItemGrafico[] = STATUS_OFERTA.map((status: StatusOferta, i) => ({
    rotulo: ROTULO_STATUS_OFERTA[status],
    valor: contagensOfertas[i],
    href: `/admin/ofertas?status=${status}`,
    cor: COR_STATUS_OFERTA[status],
  }));

  return {
    imoveis: {
      total: imoveis.length,
      porStatus: Object.fromEntries(
        STATUS_IMOVEL.map((st) => [st, imoveis.filter((i) => i.status === st).length]),
      ) as Record<StatusImovel, number>,
      porBairro: porBairro(imoveis),
      porFinalidade: porFinalidade(imoveis),
    },
    ofertas: {
      total: contagensOfertas.reduce((a, b) => a + b, 0),
      contagem: Object.fromEntries(STATUS_OFERTA.map((st, i) => [st, contagensOfertas[i]])) as Record<
        StatusOferta,
        number
      >,
      porStatus,
    },
    contratos: { aguardando, assinados },
  };
}
