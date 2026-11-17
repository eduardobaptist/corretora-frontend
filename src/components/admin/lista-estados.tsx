"use client";

import { Alert, Button, EmptyState, Skeleton, Table } from "@heroui/react";
import type { ComponentType, SVGProps } from "react";
import { Plus } from "@/components/icons";

// Estados das telas de cadastro do admin (DESIGN.md §7): carregando, erro e vazio.

export function ListaErro({ titulo, mensagem }: { titulo: string; mensagem: string }) {
  return (
    <Alert status="danger">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{titulo}</Alert.Title>
        <Alert.Description>{mensagem} Tente novamente em instantes.</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}

export function ListaVazia({
  icone: Icone,
  titulo,
  dica,
  acao,
}: {
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  titulo: string;
  dica: string;
  acao?: React.ReactNode;
}) {
  return (
    <EmptyState className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
      <Icone className="size-8 text-muted" aria-hidden />
      <p className="font-medium">{titulo}</p>
      <p className="text-sm text-muted">{dica}</p>
      {acao && <div className="mt-2">{acao}</div>}
    </EmptyState>
  );
}

/** Barra acima da tabela: contagem/busca à esquerda, ação principal à direita. */
export function ListaToolbar({ children, acao }: { children?: React.ReactNode; acao?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">{children}</div>
      {acao}
    </div>
  );
}

/** Contagem com singular/plural ("1 bairro" / "6 bairros"), anunciada ao mudar. */
export function ListaContagem({ total, singular, plural }: { total: number; singular: string; plural: string }) {
  return (
    <p className="text-sm text-muted" aria-live="polite">
      {total} {total === 1 ? singular : plural}
    </p>
  );
}

/** Botão "Novo …" desabilitado, para os estados de carregando/erro. */
export function BotaoNovoDesabilitado({ rotulo }: { rotulo: string }) {
  return (
    <Button variant="primary" isDisabled className="w-full sm:w-auto">
      <Plus className="size-4" aria-hidden />
      {rotulo}
    </Button>
  );
}

const LARGURAS = ["w-3/4", "w-1/2", "w-2/3", "w-1/3", "w-3/5"];

/** Skeleton que imita a tabela: mesmas colunas, 8 linhas com larguras variadas. */
export function TabelaSkeleton({ colunas, linhas = 8 }: { colunas: string[]; linhas?: number }) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Carregando">
          <Table.Header>
            {colunas.map((coluna, i) => (
              <Table.Column key={coluna} isRowHeader={i === 0}>
                {coluna}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {Array.from({ length: linhas }, (_, linha) => (
              <Table.Row key={linha}>
                {colunas.map((coluna, i) => (
                  <Table.Cell key={coluna}>
                    <Skeleton className={`h-4 rounded-md ${LARGURAS[(linha + i) % LARGURAS.length]}`} />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
