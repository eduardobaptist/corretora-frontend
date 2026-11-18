"use client";

import { Card } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type TooltipContentProps,
} from "recharts";
import type { ItemGrafico } from "../types";

interface GraficoBarrasProps {
  titulo: string;
  descricao: string;
  /** Ícone do cabeçalho, já renderizado (componente não atravessa servidor → client). */
  icone?: React.ReactNode;
  itens: ItemGrafico[];
  /** "imóvel"/"imóveis": total do cabeçalho, tooltip e tabela acessível. */
  unidade: { singular: string; plural: string };
  vazio: string;
  /** `barras`: horizontais, para nomes longos ou muitas categorias. `colunas`: poucas, nomes curtos. */
  forma?: "barras" | "colunas";
  /** Rótulo da ponta com a participação no total ("12 · 60%"), para parte do todo. */
  comPercentual?: boolean;
  /** Colunas: o gráfico ocupa toda a altura que o card tiver (card esticado no grid). */
  preencher?: boolean;
  /** Linha de resumo abaixo do gráfico. */
  rodape?: React.ReactNode;
}

interface Linha extends ItemGrafico {
  nome: string;
  pct: number;
}

const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("pt-BR");

// Cores só por token (DESIGN.md §6, "Gráficos"): Recharts aceita var() em fill/stroke, então o
// modo escuro troca sozinho. `--color-grafico` está validado nos dois modos (globals.css).
const COR_BARRA = "var(--color-grafico)";
const COR_TRILHO = "var(--surface-secondary)";
const COR_TEXTO = "var(--foreground)";
const COR_BASE = "var(--separator)";

const ALTURA_LINHA = 38;
const LARGURA_NOME = 148;

function encurtar(texto: string, max = 17) {
  return texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto;
}

/**
 * Nome da categoria no eixo das barras horizontais: uma linha só, cortada com "…" (o tick padrão
 * do Recharts quebra a linha quando não cabe). O nome inteiro está no tooltip e na tabela.
 */
function TickNome(props: { x?: number | string; y?: number | string; payload?: { value: string } }) {
  const nome = String(props.payload?.value ?? "").split(" · ")[0];
  return (
    <text x={Number(props.x) - 10} y={Number(props.y)} dy="0.35em" textAnchor="end" fill={COR_TEXTO} fontSize={13}>
      <title>{nome}</title>
      {encurtar(nome)}
    </text>
  );
}

/**
 * Gráfico de barras de uma série (Recharts) num card com ícone e total no cabeçalho. Sem legenda (o
 * título diz o que é); o valor fica na ponta de cada barra, sobre um trilho claro, e o tooltip
 * acrescenta a participação no total. Clicar numa barra com `href` abre a lista filtrada. Uma tabela
 * só para leitores de tela repete os números.
 */
export function GraficoBarras({
  titulo,
  descricao,
  icone,
  itens,
  unidade,
  vazio,
  forma = "barras",
  comPercentual = false,
  preencher = false,
  rodape,
}: GraficoBarrasProps) {
  const router = useRouter();
  const total = itens.reduce((soma, i) => soma + i.valor, 0);
  const linhas: Linha[] = itens.map((i) => ({
    ...i,
    nome: i.detalhe ? `${i.rotulo} · ${i.detalhe}` : i.rotulo,
    pct: total > 0 ? i.valor / total : 0,
  }));
  const qtd = (n: number) => `${num.format(n)} ${n === 1 ? unidade.singular : unidade.plural}`;
  const navegavel = linhas.some((l) => l.href);

  const abrir = (_: unknown, indice: number) => {
    const href = linhas[indice]?.href;
    if (href) router.push(href);
  };

  const rotuloDaPonta = (valor: unknown) => {
    const n = Number(valor);
    return comPercentual && total > 0 ? `${num.format(n)} · ${pct.format(n / total)}` : num.format(n);
  };

  const dica = (props: TooltipContentProps) => {
    const linha = props.active ? (props.payload?.[0]?.payload as Linha | undefined) : undefined;
    if (!linha) return null;
    return (
      <div className="rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-lg">
        <p className="flex items-center gap-2 font-semibold">
          {/* Chave da série: um traço na cor da barra (o texto fica na cor de texto). */}
          <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: linha.cor ?? COR_BARRA }} />
          {qtd(linha.valor)}
        </p>
        <p className="text-xs text-muted">
          {pct.format(linha.pct)} do total · {linha.nome}
        </p>
        {linha.href && <p className="mt-1 text-xs text-muted">Clique para ver a lista</p>}
      </div>
    );
  };

  /** O mesmo gráfico nas duas formas: `barras` (horizontais) ou colunas. */
  const desenhar = (barras: boolean) => (
    <BarChart
      responsive
      data={linhas}
      layout={barras ? "vertical" : "horizontal"}
      style={{ width: "100%", height: "100%" }}
      margin={
        barras
          ? { top: 0, right: comPercentual ? 76 : 40, bottom: 0, left: 0 }
          : { top: 24, right: 4, bottom: 0, left: 4 }
      }
      barCategoryGap={barras ? "28%" : "22%"}
      accessibilityLayer={false}
    >
      {barras ? (
        <>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="nome" width={LARGURA_NOME} tickLine={false} axisLine={false} tick={<TickNome />} />
        </>
      ) : (
        <>
          <XAxis
            dataKey="rotulo"
            tickLine={false}
            axisLine={{ stroke: COR_BASE }}
            tick={{ fill: COR_TEXTO, fontSize: 12 }}
            tickMargin={8}
            interval={0}
          />
          <YAxis hide allowDecimals={false} domain={[0, "dataMax"]} />
        </>
      )}
      <Tooltip content={dica} cursor={false} isAnimationActive={false} />
      <Bar
        dataKey="valor"
        fill={COR_BARRA}
        // Trilho até o maior valor: dá a leitura de "quanto falta" e assenta as barras no card.
        background={{ fill: COR_TRILHO, radius: 4 }}
        // Base quadrada, ponta arredondada (4px); no máximo 24px de espessura.
        radius={barras ? [0, 4, 4, 0] : [4, 4, 0, 0]}
        maxBarSize={24}
        minPointSize={(valor) => (Number(valor) > 0 ? 2 : 0)}
        // Cor por barra (`cor` do item; sem cor = a única do gráfico). `shape` substitui o `Cell`,
        // obsoleto no Recharts 3. A barra sob o ponteiro esmaece um pouco.
        shape={(props: BarShapeProps) => (
          <Rectangle
            {...props}
            fill={(props.payload as Linha | undefined)?.cor ?? COR_BARRA}
            fillOpacity={props.isActive ? 0.8 : 1}
          />
        )}
        onClick={navegavel ? abrir : undefined}
        // Sem animação: o painel rerenderiza a cada `refresh()` e as barras voltariam do zero.
        isAnimationActive={false}
        style={navegavel ? { cursor: "pointer" } : undefined}
      >
        <LabelList
          dataKey="valor"
          // Texto próprio (uma linha): o Label padrão quebra "22 · 71%" quando falta espaço.
          content={(props) => {
            const caixa = props.viewBox as { x?: number; y?: number; width?: number; height?: number } | undefined;
            if (!caixa) return null;
            const { x = 0, y = 0, width = 0, height = 0 } = caixa;
            return (
              <text
                x={barras ? x + width + 8 : x + width / 2}
                y={barras ? y + height / 2 : y - 8}
                dy={barras ? "0.35em" : 0}
                textAnchor={barras ? "start" : "middle"}
                fill={COR_TEXTO}
                fontSize={12}
                fontWeight={500}
                className="tabular-nums"
              >
                {rotuloDaPonta(props.value)}
              </text>
            );
          }}
        />
      </Bar>
    </BarChart>
  );

  // Caixa com altura definida + SVG absoluto: o Recharts sempre mede um tamanho estável.
  const barrasHorizontais = (
    <div aria-hidden className="relative" style={{ height: Math.max(120, linhas.length * ALTURA_LINHA) }}>
      <div className="absolute inset-0">{desenhar(true)}</div>
    </div>
  );

  return (
    <Card className={`gap-5 p-5 sm:p-6 ${preencher ? "h-full" : ""}`}>
      <Card.Header className="flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icone && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent [&>svg]:size-4">
              {icone}
            </span>
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <Card.Title className="text-base">{titulo}</Card.Title>
            <Card.Description>{descricao}</Card.Description>
          </div>
        </div>
        {total > 0 && (
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-2xl font-semibold leading-none tracking-tight">{num.format(total)}</span>
            <span className="mt-1 text-xs text-muted">{total === 1 ? unidade.singular : unidade.plural}</span>
          </div>
        )}
      </Card.Header>

      <Card.Content className={preencher ? "flex flex-1 flex-col gap-4" : "flex flex-col gap-4"}>
        {total === 0 ? (
          <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted">
            {vazio}
          </p>
        ) : (
          <>
            {forma === "barras" ? (
              barrasHorizontais
            ) : (
              // Colunas precisam de ~24rem: cinco rótulos não cabem num card de celular, então ali o
              // mesmo dado vira barras horizontais (container query, sem JS).
              <div className={`@container flex flex-col ${preencher ? "flex-1" : ""}`}>
                <div aria-hidden className={`relative hidden @sm:block ${preencher ? "min-h-64 flex-1" : "h-64"}`}>
                  <div className="absolute inset-0">{desenhar(false)}</div>
                </div>
                <div className="@sm:hidden">{barrasHorizontais}</div>
              </div>
            )}

            {rodape}

            {/* O SVG fica escondido do leitor de tela: esta tabela diz o mesmo em texto. */}
            <table className="sr-only">
              <caption>{titulo}</caption>
              <thead>
                <tr>
                  <th scope="col">Categoria</th>
                  <th scope="col">Quantidade</th>
                  <th scope="col">Do total</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.nome}>
                    <th scope="row">{l.nome}</th>
                    <td>{num.format(l.valor)}</td>
                    <td>{pct.format(l.pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card.Content>
    </Card>
  );
}
