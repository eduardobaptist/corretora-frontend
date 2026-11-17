"use client";

import { Button, Table } from "@heroui/react";
import { AcaoIcone } from "@/components/admin/acao-icone";
import { ConfirmarExclusao } from "@/components/admin/confirmar-exclusao";
import { ListaContagem, ListaToolbar, ListaVazia } from "@/components/admin/lista-estados";
import { ListaPaginacao, ListaProvider, ListaResultados, useLista } from "@/components/admin/lista-navegacao";
import { useAlvo } from "@/components/admin/use-alvo";
import { MapPin, Pencil, Plus, TrashBin } from "@/components/icons";
import type { Page } from "@/lib/api";
import type { ListaParams } from "@/lib/lista";
import { excluirBairro } from "../actions";
import type { Bairro } from "../types";
import { BairroForm } from "./bairro-form";

export function BairrosTabela({ page, params }: { page: Page<Bairro>; params: ListaParams }) {
  return (
    <ListaProvider params={params}>
      <BairrosConteudo page={page} />
    </ListaProvider>
  );
}

function faixaCep(b: Bairro) {
  if (b.cepInicial && b.cepFinal) return `${b.cepInicial} a ${b.cepFinal}`;
  return b.cepInicial ?? b.cepFinal ?? null;
}

function BairrosConteudo({ page }: { page: Page<Bairro> }) {
  const { navegar } = useLista();
  const form = useAlvo<Bairro>();
  const exclusao = useAlvo<Bairro>();
  const { content, page: meta } = page;

  const botaoNovo = (
    <Button variant="primary" className="w-full sm:w-auto" onPress={() => form.abrir()}>
      <Plus className="size-4" aria-hidden />
      Novo bairro
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar acao={botaoNovo}>
        <ListaContagem total={meta.totalElements} singular="bairro cadastrado" plural="bairros cadastrados" />
      </ListaToolbar>

      <ListaResultados>
        {content.length === 0 ? (
          meta.totalElements > 0 ? (
            <ListaVazia
              icone={MapPin}
              titulo="Página não encontrada"
              dica={`A lista tem ${meta.totalPages} página(s).`}
              acao={<Button variant="secondary" onPress={() => navegar({ pagina: 1 })}>Ir para a primeira página</Button>}
            />
          ) : (
            <ListaVazia
              icone={MapPin}
              titulo="Nenhum bairro cadastrado"
              dica="Cadastre os bairros atendidos para usá-los nos imóveis."
              acao={botaoNovo}
            />
          )
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Bairros" className="min-w-[36rem]">
                <Table.Header>
                  <Table.Column isRowHeader>Bairro</Table.Column>
                  <Table.Column>Cidade</Table.Column>
                  <Table.Column>Faixa de CEP</Table.Column>
                  <Table.Column className="text-end">Ações</Table.Column>
                </Table.Header>
                <Table.Body items={content}>
                  {(bairro) => (
                    <Table.Row id={bairro.id}>
                      <Table.Cell className="font-medium">{bairro.nome}</Table.Cell>
                      <Table.Cell>
                        {bairro.cidade}/{bairro.estado}
                      </Table.Cell>
                      <Table.Cell className="text-muted">{faixaCep(bairro)}</Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1">
                          <AcaoIcone label={`Editar ${bairro.nome}`} onPress={() => form.abrir(bairro)}>
                            <Pencil className="size-4" aria-hidden />
                          </AcaoIcone>
                          <AcaoIcone label={`Excluir ${bairro.nome}`} onPress={() => exclusao.abrir(bairro)}>
                            <TrashBin className="size-4 text-danger" aria-hidden />
                          </AcaoIcone>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
        <ListaPaginacao page={meta} />
      </ListaResultados>

      <BairroForm key={form.chave} bairro={form.item} aberto={form.aberto} onFechar={form.fechar} />

      <ConfirmarExclusao
        aberto={exclusao.aberto}
        onFechar={exclusao.fechar}
        titulo="Excluir bairro?"
        onConfirmar={() => excluirBairro(exclusao.item!.id)}
      >
        <strong className="text-foreground">{exclusao.item?.nome}</strong>
        {exclusao.item && ` (${exclusao.item.cidade}/${exclusao.item.estado})`} será excluído. Isso não pode
        ser desfeito. Bairros com imóveis vinculados não podem ser excluídos.
      </ConfirmarExclusao>
    </div>
  );
}
