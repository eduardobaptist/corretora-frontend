"use client";

import { Button, Card, Label, NumberField, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import type { Key } from "react";
import type { OpcoesFiltro } from "../utils";
import { contarFiltros, type Negocio } from "../vitrine-params";
import { FiltroSelect } from "./filtro-select";
import { useVitrine } from "./vitrine-navegacao";

const NEGOCIOS: { id: Negocio | "todos"; nome: string }[] = [
  { id: "todos", nome: "Todos" },
  { id: "comprar", nome: "Comprar" },
  { id: "alugar", nome: "Alugar" },
];

const DORMITORIOS = [
  { id: "0", nome: "Todos" },
  { id: "1", nome: "1+" },
  { id: "2", nome: "2+" },
  { id: "3", nome: "3+" },
  { id: "4", nome: "4+" },
];

const BRL: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
};

function primeiro(keys: Set<Key> | "all"): string | null {
  if (keys === "all") return null;
  const [k] = keys;
  return k == null ? null : String(k);
}

/** Painel de filtros: lateral fixa no desktop, recolhível no celular. */
export function VitrineFiltros({ opcoes }: { opcoes: OpcoesFiltro }) {
  const { params, navegar, filtrosAbertos } = useVitrine();
  const ativos = contarFiltros({ ...params, q: "" });

  const bairros = params.cidade
    ? opcoes.bairros.filter((b) => b.cidade === params.cidade)
    : opcoes.bairros;

  return (
    <aside
      id="vitrine-filtros"
      aria-label="Filtros"
      className={`${filtrosAbertos ? "block" : "hidden"} @4xl/vitrine:block`}
    >
      <Card className="gap-5 @4xl/vitrine:sticky @4xl/vitrine:top-(--topo-fixo) @4xl/vitrine:max-h-[calc(100dvh-var(--topo-fixo)-1rem)] @4xl/vitrine:overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Filtros</h2>
          {ativos > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onPress={() =>
                navegar({
                  negocio: null,
                  tipo: null,
                  cidade: null,
                  bairro: null,
                  dormitorios: null,
                  precoMin: null,
                  precoMax: null,
                })
              }
            >
              Limpar ({ativos})
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label id="filtro-negocio">Negócio</Label>
          <ToggleButtonGroup
            aria-labelledby="filtro-negocio"
            selectionMode="single"
            disallowEmptySelection
            fullWidth
            size="sm"
            selectedKeys={[params.negocio ?? "todos"]}
            onSelectionChange={(keys) => {
              const k = primeiro(keys);
              navegar({ negocio: k === "comprar" || k === "alugar" ? k : null });
            }}
          >
            {NEGOCIOS.map((n) => (
              <ToggleButton key={n.id} id={n.id}>
                {n.nome}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <FiltroSelect
          label="Tipo de imóvel"
          value={params.tipo}
          opcoes={opcoes.tipos}
          onChange={(tipo) => navegar({ tipo })}
        />

        <FiltroSelect
          label="Cidade"
          value={params.cidade}
          opcoes={opcoes.cidades}
          rotuloTodos="Todas"
          onChange={(cidade) => {
            // Troca de cidade descarta o bairro se ele não pertence à nova cidade.
            const manterBairro = opcoes.bairros.some(
              (b) => b.id === params.bairro && b.cidade === cidade,
            );
            navegar({ cidade, bairro: manterBairro ? params.bairro : null });
          }}
        />

        <FiltroSelect
          label="Bairro"
          value={params.bairro}
          opcoes={bairros}
          onChange={(bairro) => navegar({ bairro })}
          isDisabled={bairros.length === 0}
        />

        <div className="flex flex-col gap-2">
          <Label id="filtro-dormitorios">Dormitórios</Label>
          <ToggleButtonGroup
            aria-labelledby="filtro-dormitorios"
            selectionMode="single"
            disallowEmptySelection
            fullWidth
            size="sm"
            selectedKeys={[String(params.dormitorios ?? 0)]}
            onSelectionChange={(keys) => {
              const n = Number(primeiro(keys) ?? 0);
              navegar({ dormitorios: n > 0 ? n : null });
            }}
          >
            {DORMITORIOS.map((d) => (
              <ToggleButton key={d.id} id={d.id}>
                {d.nome}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">
            {params.negocio === "alugar" ? "Aluguel mensal" : "Preço"}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              aria-label="Preço mínimo"
              minValue={0}
              step={params.negocio === "alugar" ? 100 : 10000}
              formatOptions={BRL}
              value={params.precoMin ?? NaN}
              onChange={(v) => navegar({ precoMin: Number.isFinite(v) && v > 0 ? v : null })}
            >
              <NumberField.Group>
                <NumberField.Input placeholder="Mínimo" />
              </NumberField.Group>
            </NumberField>
            <NumberField
              aria-label="Preço máximo"
              minValue={0}
              step={params.negocio === "alugar" ? 100 : 10000}
              formatOptions={BRL}
              value={params.precoMax ?? NaN}
              onChange={(v) => navegar({ precoMax: Number.isFinite(v) && v > 0 ? v : null })}
            >
              <NumberField.Group>
                <NumberField.Input placeholder="Máximo" />
              </NumberField.Group>
            </NumberField>
          </div>
        </fieldset>
      </Card>
    </aside>
  );
}
