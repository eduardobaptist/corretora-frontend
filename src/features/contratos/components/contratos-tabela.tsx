"use client";

import { Button, buttonVariants, Chip, Table } from "@heroui/react";
import Link from "next/link";
import { AcaoIcone } from "@/components/admin/acao-icone";
import { ConfirmarAcao } from "@/components/admin/confirmar-exclusao";
import { ListaContagem, ListaToolbar, ListaVazia } from "@/components/admin/lista-estados";
import { ListaPaginacao, ListaProvider, ListaResultados, useLista } from "@/components/admin/lista-navegacao";
import { useAlvo } from "@/components/admin/use-alvo";
import { ArrowDownToLine, CircleXmark, FileText, PencilToLine } from "@/components/icons";
import { FiltroSelect } from "@/features/imoveis/components/filtro-select";
import { ValorOferta } from "@/features/ofertas/components/oferta-chips";
import { ROTULO_TIPO_OFERTA } from "@/features/ofertas/types";
import type { Page } from "@/lib/api";
import { formatData, formatDataHora } from "@/lib/format";
import type { ListaParams } from "@/lib/lista";
import { assinarContrato, cancelarContrato } from "../actions";
import {
  hrefPdf,
  ROTULO_ORIGEM,
  ROTULO_STATUS_CONTRATO,
  STATUS_CONTRATO,
  type Contrato,
  type StatusContrato,
} from "../types";
import { ContratoStatusChip } from "./contrato-status-chip";
import { PdfVisualizador } from "./pdf-visualizador";

type Area = "admin" | "cliente";

const OPCOES_STATUS = STATUS_CONTRATO.map((s) => ({ id: s, nome: ROTULO_STATUS_CONTRATO[s] }));

/** Select "Situação" da toolbar (`?status=`). */
export function FiltroStatusContrato({
  valor,
  onChange,
  isDisabled,
}: {
  valor: StatusContrato | null;
  onChange?: (valor: string | null) => void;
  isDisabled?: boolean;
}) {
  return (
    <FiltroSelect
      label="Situação"
      value={valor}
      opcoes={OPCOES_STATUS}
      onChange={(v) => onChange?.(v)}
      isDisabled={isDisabled}
      className="w-full sm:w-60"
    />
  );
}

interface ContratosTabelaProps {
  page: Page<Contrato>;
  area: Area;
  params: ListaParams;
}

export function ContratosTabela({ params, ...props }: ContratosTabelaProps) {
  return (
    <ListaProvider params={params}>
      <ContratosConteudo {...props} />
    </ListaProvider>
  );
}

function ContratosConteudo({ page, area }: Omit<ContratosTabelaProps, "params">) {
  const { params, navegar } = useLista();
  const pdf = useAlvo<Contrato>();
  const cancelamento = useAlvo<Contrato>();
  const assinatura = useAlvo<Contrato>();
  const { content, page: meta } = page;
  const admin = area === "admin";

  const vazio = () => {
    if (params.status) {
      return (
        <ListaVazia
          icone={FileText}
          titulo={`Nenhum contrato ${ROTULO_STATUS_CONTRATO[params.status as StatusContrato].toLowerCase()}`}
          dica="Escolha outra situação ou veja todos os contratos."
          acao={<Button variant="secondary" onPress={() => navegar({ status: "" })}>Ver todos</Button>}
        />
      );
    }
    if (meta.totalElements > 0) {
      return (
        <ListaVazia
          icone={FileText}
          titulo="Página não encontrada"
          dica={`A lista tem ${meta.totalPages} página(s).`}
          acao={<Button variant="secondary" onPress={() => navegar({ pagina: 1 })}>Ir para a primeira página</Button>}
        />
      );
    }
    return admin ? (
      <ListaVazia
        icone={FileText}
        titulo="Nenhum contrato ainda"
        dica="Aceite uma oferta e crie o contrato a partir dela."
        acao={
          <Link href="/admin/ofertas?status=ACEITA" className={buttonVariants({ variant: "secondary" })}>
            Ver ofertas aceitas
          </Link>
        }
      />
    ) : (
      <ListaVazia
        icone={FileText}
        titulo="Nenhum contrato por enquanto"
        dica="Quando a corretora aceitar uma oferta sua, o contrato aparece aqui para você assinar."
        acao={
          <Link href="/cliente/ofertas" className={buttonVariants({ variant: "secondary" })}>
            Ver minhas ofertas
          </Link>
        }
      />
    );
  };

  const aguardando = (c: Contrato) => c.status === "AGUARDANDO_ASSINATURA";

  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar>
        <FiltroStatusContrato
          valor={(params.status || null) as StatusContrato | null}
          onChange={(status) => navegar({ status: status ?? "" })}
        />
        <ListaContagem
          total={meta.totalElements}
          singular={params.status ? "contrato encontrado" : "contrato"}
          plural={params.status ? "contratos encontrados" : "contratos"}
        />
      </ListaToolbar>

      <ListaResultados>
        {content.length === 0 ? (
          vazio()
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Contratos" className={admin ? "min-w-[56rem]" : "min-w-[44rem]"}>
                <Table.Header>
                  {admin ? (
                    <>
                      <Table.Column isRowHeader>Contrato</Table.Column>
                      <Table.Column>Imóvel</Table.Column>
                      <Table.Column>Cliente</Table.Column>
                    </>
                  ) : (
                    <Table.Column isRowHeader>Imóvel</Table.Column>
                  )}
                  <Table.Column>Negócio</Table.Column>
                  <Table.Column>Situação</Table.Column>
                  {!admin && <Table.Column>Datas</Table.Column>}
                  <Table.Column className="text-end">Ações</Table.Column>
                </Table.Header>
                <Table.Body items={content}>
                  {(contrato) => {
                    const { oferta } = contrato;
                    return (
                      <Table.Row id={contrato.id}>
                        {admin && (
                          <Table.Cell>
                            <div className="flex min-w-0 flex-col">
                              <span className="font-medium">Nº {contrato.id}</span>
                              <span className="text-xs text-muted">
                                {ROTULO_ORIGEM[contrato.origem]} em {formatData(contrato.dataAprovacao)}
                              </span>
                            </div>
                          </Table.Cell>
                        )}
                        <Table.Cell>
                          <div className="flex min-w-0 flex-col">
                            <span className="line-clamp-1 font-medium">{oferta.imovel.titulo}</span>
                            <span className="text-xs text-muted">
                              Cód. {oferta.imovel.id} · oferta nº {oferta.id}
                            </span>
                          </div>
                        </Table.Cell>
                        {admin && (
                          <Table.Cell>
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate">{oferta.usuario.nome}</span>
                              <span className="truncate text-xs text-muted">{oferta.usuario.email}</span>
                            </div>
                          </Table.Cell>
                        )}
                        <Table.Cell>
                          <div className="flex flex-col items-start gap-1">
                            <ValorOferta valor={oferta.valorProposto} tipo={oferta.tipo} />
                            <Chip size="sm" variant="secondary">
                              {ROTULO_TIPO_OFERTA[oferta.tipo]}
                            </Chip>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col items-start gap-1">
                            <ContratoStatusChip status={contrato.status} />
                            {admin && contrato.dataAssinatura && (
                              <span className="text-xs text-muted">em {formatData(contrato.dataAssinatura)}</span>
                            )}
                          </div>
                        </Table.Cell>
                        {!admin && (
                          <Table.Cell>
                            <div className="flex flex-col text-xs text-muted">
                              <span>Emitido em {formatData(contrato.dataAprovacao)}</span>
                              {contrato.dataAssinatura && <span>Assinado em {formatData(contrato.dataAssinatura)}</span>}
                            </div>
                          </Table.Cell>
                        )}
                        <Table.Cell>
                          <div className="flex items-center justify-end gap-1">
                            {!admin && aguardando(contrato) ? (
                              <Button size="sm" variant="primary" onPress={() => pdf.abrir(contrato)}>
                                <PencilToLine className="size-4" aria-hidden />
                                Ler e assinar
                              </Button>
                            ) : (
                              <AcaoIcone label={`Ver contrato nº ${contrato.id}`} onPress={() => pdf.abrir(contrato)}>
                                <FileText className="size-4" aria-hidden />
                              </AcaoIcone>
                            )}
                            {admin && (
                              <a
                                href={hrefPdf(contrato.id, { baixar: true })}
                                aria-label={`Baixar contrato nº ${contrato.id}`}
                                title="Baixar PDF"
                                className={buttonVariants({ variant: "ghost", size: "sm", isIconOnly: true })}
                              >
                                <ArrowDownToLine className="size-4" aria-hidden />
                              </a>
                            )}
                            {admin && aguardando(contrato) && (
                              <AcaoIcone
                                label={`Cancelar contrato nº ${contrato.id}`}
                                onPress={() => cancelamento.abrir(contrato)}
                              >
                                <CircleXmark className="size-4 text-danger" aria-hidden />
                              </AcaoIcone>
                            )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  }}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
        <ListaPaginacao page={meta} />
      </ListaResultados>

      <PdfVisualizador
        aberto={pdf.aberto}
        onFechar={pdf.fechar}
        titulo={`Contrato de ${pdf.item ? ROTULO_TIPO_OFERTA[pdf.item.oferta.tipo].toLowerCase() : ""}`}
        descricao={
          pdf.item
            ? `${pdf.item.oferta.imovel.titulo} · ${ROTULO_STATUS_CONTRATO[pdf.item.status]}${
                pdf.item.dataAssinatura ? ` em ${formatDataHora(pdf.item.dataAssinatura)}` : ""
              }`
            : undefined
        }
        src={pdf.item ? hrefPdf(pdf.item.id) : null}
        hrefDownload={pdf.item ? hrefPdf(pdf.item.id, { baixar: true }) : undefined}
        acao={
          !admin && pdf.item && aguardando(pdf.item) ? (
            <Button variant="primary" onPress={() => assinatura.abrir(pdf.item)}>
              <PencilToLine className="size-4" aria-hidden />
              Assinar contrato
            </Button>
          ) : undefined
        }
      />

      {admin ? (
        <ConfirmarAcao
          aberto={cancelamento.aberto}
          onFechar={cancelamento.fechar}
          titulo="Cancelar contrato?"
          rotuloConfirmar="Cancelar contrato"
          rotuloPendente="Cancelando…"
          rotuloFechar="Voltar"
          icone={<CircleXmark className="size-4" aria-hidden />}
          onConfirmar={() => cancelarContrato(cancelamento.item!.id)}
        >
          O contrato nº {cancelamento.item?.id} de{" "}
          <strong className="text-foreground">{cancelamento.item?.oferta.usuario.nome}</strong> não poderá mais ser
          assinado e a oferta dele também será cancelada. O imóvel volta a ficar disponível e as ofertas em espera
          voltam a pendentes. Para fechar negócio de novo, aceite outra oferta. Isso não pode ser desfeito.
        </ConfirmarAcao>
      ) : (
        <ConfirmarAcao
          aberto={assinatura.aberto}
          onFechar={assinatura.fechar}
          status="accent"
          titulo="Assinar contrato?"
          rotuloConfirmar="Assinar"
          rotuloPendente="Assinando…"
          rotuloFechar="Voltar"
          icone={<PencilToLine className="size-4" aria-hidden />}
          onConfirmar={async () => {
            const resultado = await assinarContrato(assinatura.item!.id);
            if (resultado.ok) pdf.fechar();
            return resultado;
          }}
        >
          Ao assinar, você confirma que leu e concorda com o contrato de{" "}
          {assinatura.item ? ROTULO_TIPO_OFERTA[assinatura.item.oferta.tipo].toLowerCase() : ""} do imóvel{" "}
          <strong className="text-foreground">{assinatura.item?.oferta.imovel.titulo}</strong>. O imóvel passa a{" "}
          {assinatura.item?.oferta.tipo === "ALUGUEL" ? "alugado" : "vendido"}. Isso não pode ser desfeito.
        </ConfirmarAcao>
      )}
    </div>
  );
}
