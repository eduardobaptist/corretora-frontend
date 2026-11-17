"use client";

import { Pagination } from "@heroui/react";

type Item = number | "ellipsis";

/** 1 … 4 5 [6] 7 8 … 20: sempre a primeira, a última e a vizinhança da atual. */
function paginasVisiveis(atual: number, total: number, vizinhos = 1): Item[] {
  const itens: Item[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - atual) <= vizinhos) itens.push(p);
    else if (itens.at(-1) !== "ellipsis") itens.push("ellipsis");
  }
  return itens;
}

export interface PaginacaoProps {
  /** 1-based */
  atual: number;
  totalPaginas: number;
  totalItens: number;
  tamanho: number;
  onIr: (pagina: number) => void;
}

/** Paginação HeroUI com resumo "Mostrando X–Y de N". Some quando há só 1 página. */
export function Paginacao({ atual, totalPaginas, totalItens, tamanho, onIr }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  const inicio = (atual - 1) * tamanho + 1;
  const fim = Math.min(atual * tamanho, totalItens);

  return (
    <Pagination aria-label="Paginação" className="flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <Pagination.Summary className="text-sm text-muted">
        Mostrando {inicio}–{fim} de {totalItens}
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={atual <= 1} onPress={() => onIr(atual - 1)}>
            <Pagination.PreviousIcon />
            <span className="hidden sm:inline">Anterior</span>
          </Pagination.Previous>
        </Pagination.Item>

        {/* Celular: só setas + "X de N" (os números não cabem em 360px) */}
        <Pagination.Item className="px-2 text-sm text-muted sm:hidden">
          {atual} de {totalPaginas}
        </Pagination.Item>

        {paginasVisiveis(atual, totalPaginas).map((item, i) =>
          item === "ellipsis" ? (
            <Pagination.Item key={`e${i}`} className="hidden sm:inline-flex">
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={item} className="hidden sm:inline-flex">
              <Pagination.Link
                isActive={item === atual}
                aria-label={`Página ${item}`}
                onPress={() => onIr(item)}
              >
                {item}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}

        <Pagination.Item>
          <Pagination.Next isDisabled={atual >= totalPaginas} onPress={() => onIr(atual + 1)}>
            <span className="hidden sm:inline">Próxima</span>
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
