"use client";

import { Button, Chip, Table } from "@heroui/react";
import { useRouter } from "next/navigation";
import { AcaoIcone } from "@/components/admin/acao-icone";
import { ConfirmarExclusao } from "@/components/admin/confirmar-exclusao";
import { ListaContagem, ListaToolbar, ListaVazia } from "@/components/admin/lista-estados";
import { ListaPaginacao, ListaProvider, ListaResultados, useLista } from "@/components/admin/lista-navegacao";
import { useAlvo } from "@/components/admin/use-alvo";
import { ArrowUpRightFromSquare, House, Pencil, Plus, StarFill, TrashBin } from "@/components/icons";
import type { Page } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { ListaParams } from "@/lib/lista";
import { ImovelFoto, ImovelFotoPlaceholder } from "../../components/imovel-midia";
import { StatusChip } from "../../components/status-chip";
import type { Imovel } from "../../types";
import { formatCidade } from "../../utils";
import { hrefImovel } from "../../vitrine-params";
import { excluirImovel } from "../actions";
import { ADMIN_IMOVEIS } from "../types";

export function ImoveisTabela({ page, params }: { page: Page<Imovel>; params: ListaParams }) {
  return (
    <ListaProvider params={params}>
      <ImoveisConteudo page={page} />
    </ListaProvider>
  );
}

function ImoveisConteudo({ page }: { page: Page<Imovel> }) {
  const router = useRouter();
  const { navegar } = useLista();
  const exclusao = useAlvo<Imovel>();
  const { content, page: meta } = page;

  const botaoNovo = (
    <Button variant="primary" className="w-full sm:w-auto" onPress={() => router.push(`${ADMIN_IMOVEIS}/novo`)}>
      <Plus className="size-4" aria-hidden />
      Novo imóvel
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar acao={botaoNovo}>
        <ListaContagem total={meta.totalElements} singular="imóvel cadastrado" plural="imóveis cadastrados" />
      </ListaToolbar>

      <ListaResultados>
        {content.length === 0 ? (
          meta.totalElements > 0 ? (
            <ListaVazia
              icone={House}
              titulo="Página não encontrada"
              dica={`A lista tem ${meta.totalPages} página(s).`}
              acao={<Button variant="secondary" onPress={() => navegar({ pagina: 1 })}>Ir para a primeira página</Button>}
            />
          ) : (
            <ListaVazia
              icone={House}
              titulo="Nenhum imóvel cadastrado"
              dica="Cadastre o primeiro imóvel para ele aparecer na vitrine."
              acao={botaoNovo}
            />
          )
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Imóveis" className="min-w-[52rem]">
                <Table.Header>
                  <Table.Column isRowHeader>Imóvel</Table.Column>
                  <Table.Column>Tipo</Table.Column>
                  <Table.Column>Finalidade</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column>Preço</Table.Column>
                  <Table.Column className="text-end">Ações</Table.Column>
                </Table.Header>
                <Table.Body items={content}>
                  {(imovel) => (
                    <Table.Row id={imovel.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                            {imovel.fotos[0] ? (
                              <ImovelFoto src={imovel.fotos[0]} alt="" sizes="64px" />
                            ) : (
                              <ImovelFotoPlaceholder iconClassName="size-5" />
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span className="line-clamp-1">{imovel.titulo}</span>
                              {imovel.destaque && (
                                <StarFill className="size-3.5 shrink-0 text-accent" aria-label="Destaque" />
                              )}
                            </span>
                            <span className="truncate text-xs text-muted">
                              Cód. {imovel.id}
                              {imovel.bairro && ` · ${imovel.bairro.nome}, ${formatCidade(imovel)}`}
                            </span>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>{imovel.tipoImovel?.nome}</Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" variant="secondary">
                          {imovel.finalidade}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <StatusChip status={imovel.status} />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col text-sm">
                          {imovel.precoVenda != null && <span>{formatCurrency(imovel.precoVenda)}</span>}
                          {imovel.precoAluguel != null && (
                            <span>
                              {formatCurrency(imovel.precoAluguel)}
                              <span className="text-muted">/mês</span>
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1">
                          <AcaoIcone
                            label={`Ver ${imovel.titulo} na vitrine`}
                            onPress={() => router.push(hrefImovel("/admin/vitrine", imovel.id))}
                          >
                            <ArrowUpRightFromSquare className="size-4" aria-hidden />
                          </AcaoIcone>
                          <AcaoIcone
                            label={`Editar ${imovel.titulo}`}
                            onPress={() => router.push(`${ADMIN_IMOVEIS}/${imovel.id}`)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </AcaoIcone>
                          <AcaoIcone label={`Excluir ${imovel.titulo}`} onPress={() => exclusao.abrir(imovel)}>
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

      <ConfirmarExclusao
        aberto={exclusao.aberto}
        onFechar={exclusao.fechar}
        titulo="Excluir imóvel?"
        onConfirmar={() => excluirImovel(exclusao.item!.id)}
      >
        <strong className="text-foreground">{exclusao.item?.titulo}</strong> (cód. {exclusao.item?.id}) sairá da
        vitrine e do cadastro. Isso não pode ser desfeito.
        {exclusao.item && exclusao.item.fotos.length > 0 && (
          <> Este imóvel tem {exclusao.item.fotos.length === 1 ? "1 foto" : `${exclusao.item.fotos.length} fotos`}.</>
        )}
      </ConfirmarExclusao>
    </div>
  );
}
