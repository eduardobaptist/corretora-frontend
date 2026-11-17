"use client";

import { Button, Table } from "@heroui/react";
import { AcaoIcone } from "@/components/admin/acao-icone";
import { ConfirmarExclusao } from "@/components/admin/confirmar-exclusao";
import { ListaContagem, ListaToolbar, ListaVazia } from "@/components/admin/lista-estados";
import { ListaPaginacao, ListaProvider, ListaResultados, useLista } from "@/components/admin/lista-navegacao";
import { useAlvo } from "@/components/admin/use-alvo";
import { Pencil, Plus, Tags, TrashBin } from "@/components/icons";
import type { Page } from "@/lib/api";
import type { ListaParams } from "@/lib/lista";
import { excluirTipoImovel } from "../actions";
import type { TipoImovel } from "../types";
import { TipoImovelForm } from "./tipo-imovel-form";

export function TiposImoveisTabela({ page, params }: { page: Page<TipoImovel>; params: ListaParams }) {
  return (
    <ListaProvider params={params}>
      <TiposConteudo page={page} />
    </ListaProvider>
  );
}

function TiposConteudo({ page }: { page: Page<TipoImovel> }) {
  const { navegar } = useLista();
  const form = useAlvo<TipoImovel>();
  const exclusao = useAlvo<TipoImovel>();
  const { content, page: meta } = page;

  const botaoNovo = (
    <Button variant="primary" className="w-full sm:w-auto" onPress={() => form.abrir()}>
      <Plus className="size-4" aria-hidden />
      Novo tipo
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar acao={botaoNovo}>
        <ListaContagem total={meta.totalElements} singular="tipo cadastrado" plural="tipos cadastrados" />
      </ListaToolbar>

      <ListaResultados>
        {content.length === 0 ? (
          meta.totalElements > 0 ? (
            <ListaVazia
              icone={Tags}
              titulo="Página não encontrada"
              dica={`A lista tem ${meta.totalPages} página(s).`}
              acao={<Button variant="secondary" onPress={() => navegar({ pagina: 1 })}>Ir para a primeira página</Button>}
            />
          ) : (
            <ListaVazia
              icone={Tags}
              titulo="Nenhum tipo de imóvel cadastrado"
              dica="Cadastre categorias como Casa, Apartamento ou Terreno."
              acao={botaoNovo}
            />
          )
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Tipos de imóvel" className="min-w-[32rem]">
                <Table.Header>
                  <Table.Column isRowHeader>Tipo</Table.Column>
                  <Table.Column>Descrição</Table.Column>
                  <Table.Column className="text-end">Ações</Table.Column>
                </Table.Header>
                <Table.Body items={content}>
                  {(tipo) => (
                    <Table.Row id={tipo.id}>
                      <Table.Cell className="font-medium">{tipo.nome}</Table.Cell>
                      <Table.Cell className="max-w-md">
                        <span className="line-clamp-2 text-muted">{tipo.descricao}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1">
                          <AcaoIcone label={`Editar ${tipo.nome}`} onPress={() => form.abrir(tipo)}>
                            <Pencil className="size-4" aria-hidden />
                          </AcaoIcone>
                          <AcaoIcone label={`Excluir ${tipo.nome}`} onPress={() => exclusao.abrir(tipo)}>
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

      <TipoImovelForm key={form.chave} tipo={form.item} aberto={form.aberto} onFechar={form.fechar} />

      <ConfirmarExclusao
        aberto={exclusao.aberto}
        onFechar={exclusao.fechar}
        titulo="Excluir tipo de imóvel?"
        onConfirmar={() => excluirTipoImovel(exclusao.item!.id)}
      >
        O tipo <strong className="text-foreground">{exclusao.item?.nome}</strong> será excluído. Isso não pode
        ser desfeito. Tipos usados por imóveis não podem ser excluídos.
      </ConfirmarExclusao>
    </div>
  );
}
