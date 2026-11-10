"use client";

import { Button } from "@heroui/react";
import { Sliders } from "@/components/icons";
import { contarFiltros, ORDENACOES, type OrdemId } from "../vitrine-params";
import { FiltroSelect } from "./filtro-select";
import { useVitrine } from "./vitrine-navegacao";

const OPCOES_ORDEM = Object.entries(ORDENACOES).map(([id, nome]) => ({ id, nome }));

/** Contagem de resultados, botão de filtros (celular) e ordenação. */
export function VitrineToolbar({ total }: { total: number }) {
  const { params, navegar, filtrosAbertos, setFiltrosAbertos } = useVitrine();
  const ativos = contarFiltros({ ...params, q: "" });

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <p className="text-sm text-muted" aria-live="polite">
        {total === 1 ? "1 imóvel encontrado" : `${total} imóveis encontrados`}
      </p>

      <div className="flex w-full items-end gap-2 sm:w-auto">
        <Button
          variant="secondary"
          className="@4xl/vitrine:hidden"
          aria-expanded={filtrosAbertos}
          aria-controls="vitrine-filtros"
          onPress={() => setFiltrosAbertos(!filtrosAbertos)}
        >
          <Sliders className="size-4" aria-hidden />
          Filtros{ativos > 0 ? ` (${ativos})` : ""}
        </Button>
        <FiltroSelect
          label="Ordenar por"
          className="min-w-0 flex-1 sm:w-48 sm:flex-none"
          value={params.ordem}
          opcoes={OPCOES_ORDEM}
          rotuloTodos={null}
          onChange={(ordem) => navegar({ ordem: (ordem ?? "destaques") as OrdemId })}
        />
      </div>
    </div>
  );
}
