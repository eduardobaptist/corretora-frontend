"use client";

import { Button, buttonVariants, Chip, Table } from "@heroui/react";
import Link from "next/link";
import { AcaoIcone } from "@/components/admin/acao-icone";
import { ConfirmarAcao } from "@/components/admin/confirmar-exclusao";
import { ListaContagem, ListaVazia } from "@/components/admin/lista-estados";
import { ListaPaginacao, ListaProvider, ListaResultados, useLista } from "@/components/admin/lista-navegacao";
import { useAlvo } from "@/components/admin/use-alvo";
import { CircleDollar, CircleXmark } from "@/components/icons";
import type { Page } from "@/lib/api";
import { formatData } from "@/lib/format";
import type { ListaParams } from "@/lib/lista";
import { cancelarOferta } from "../actions";
import { ofertaEmAberto, ROTULO_TIPO_OFERTA, type Oferta } from "../types";
import { OfertaStatusChip, ValorOferta } from "./oferta-chips";

const VITRINE = "/cliente/vitrine";

export function MinhasOfertasTabela({ page, params }: { page: Page<Oferta>; params: ListaParams }) {
  return (
    <ListaProvider params={params}>
      <MinhasOfertasConteudo page={page} />
    </ListaProvider>
  );
}

function MinhasOfertasConteudo({ page }: { page: Page<Oferta> }) {
  const { navegar } = useLista();
  const cancelamento = useAlvo<Oferta>();
  const { content, page: meta } = page;

  const vazio = () =>
    meta.totalElements > 0 ? (
      <ListaVazia
        icone={CircleDollar}
        titulo="Página não encontrada"
        dica={`A lista tem ${meta.totalPages} página(s).`}
        acao={<Button variant="secondary" onPress={() => navegar({ pagina: 1 })}>Ir para a primeira página</Button>}
      />
    ) : (
      <ListaVazia
        icone={CircleDollar}
        titulo="Você ainda não fez nenhuma oferta"
        dica="Abra um imóvel da vitrine e use “Fazer uma oferta” para propor um valor."
        acao={
          <Link href={VITRINE} className={buttonVariants({ variant: "secondary" })}>
            Ver a vitrine
          </Link>
        }
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <ListaContagem total={meta.totalElements} singular="oferta" plural="ofertas" />
      <ListaResultados>
        {content.length === 0 ? (
          vazio()
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Minhas ofertas" className="min-w-[44rem]">
                <Table.Header>
                  <Table.Column isRowHeader>Imóvel</Table.Column>
                  <Table.Column>Negócio</Table.Column>
                  <Table.Column>Valor proposto</Table.Column>
                  <Table.Column>Enviada em</Table.Column>
                  <Table.Column>Situação</Table.Column>
                  <Table.Column className="text-end">Ações</Table.Column>
                </Table.Header>
                <Table.Body items={content}>
                  {(oferta) => (
                    <Table.Row id={oferta.id}>
                      <Table.Cell>
                        <div className="flex min-w-0 flex-col">
                          <Link
                            href={`${VITRINE}/${oferta.imovel.id}`}
                            className="line-clamp-1 font-medium hover:underline"
                          >
                            {oferta.imovel.titulo}
                          </Link>
                          {oferta.mensagem && (
                            <span className="line-clamp-1 text-xs text-muted">“{oferta.mensagem}”</span>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" variant="secondary">
                          {ROTULO_TIPO_OFERTA[oferta.tipo]}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <ValorOferta valor={oferta.valorProposto} tipo={oferta.tipo} />
                      </Table.Cell>
                      <Table.Cell className="text-muted">{formatData(oferta.createdAt)}</Table.Cell>
                      <Table.Cell>
                        <OfertaStatusChip status={oferta.status} />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1">
                          {ofertaEmAberto(oferta.status) && (
                            <AcaoIcone
                              label={`Cancelar oferta por ${oferta.imovel.titulo}`}
                              onPress={() => cancelamento.abrir(oferta)}
                            >
                              <CircleXmark className="size-4 text-danger" aria-hidden />
                            </AcaoIcone>
                          )}
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

      <ConfirmarAcao
        aberto={cancelamento.aberto}
        onFechar={cancelamento.fechar}
        titulo="Cancelar oferta?"
        rotuloConfirmar="Cancelar oferta"
        rotuloPendente="Cancelando…"
        rotuloFechar="Voltar"
        icone={<CircleXmark className="size-4" aria-hidden />}
        onConfirmar={() => cancelarOferta(cancelamento.item!.id)}
      >
        Sua oferta por <strong className="text-foreground">{cancelamento.item?.imovel.titulo}</strong> será
        retirada e a corretora não poderá mais aceitá-la. Se mudar de ideia, você pode fazer uma nova oferta.
      </ConfirmarAcao>
    </div>
  );
}
