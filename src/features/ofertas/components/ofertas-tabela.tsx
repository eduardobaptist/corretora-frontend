"use client";

import { Button, Chip, Modal, Table } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AcaoIcone } from "@/components/admin/acao-icone";
import { ConfirmarAcao } from "@/components/admin/confirmar-exclusao";
import { ListaContagem, ListaToolbar, ListaVazia } from "@/components/admin/lista-estados";
import { ListaPaginacao, ListaProvider, ListaResultados, useLista } from "@/components/admin/lista-navegacao";
import { useAlvo } from "@/components/admin/use-alvo";
import { CircleCheck, CircleDollar, CircleXmark, Clock, Eye, FilePlus, FileText } from "@/components/icons";
import { ContratoStatusChip } from "@/features/contratos/components/contrato-status-chip";
import { PdfVisualizador } from "@/features/contratos/components/pdf-visualizador";
import { hrefPdf, type Contrato } from "@/features/contratos/types";
import { FiltroSelect } from "@/features/imoveis/components/filtro-select";
import { StatusChip } from "@/features/imoveis/components/status-chip";
import { ROTULO_STATUS_IMOVEL } from "@/features/imoveis/types";
import type { Page } from "@/lib/api";
import { formatCurrency, formatData, formatDataHora } from "@/lib/format";
import type { ListaParams } from "@/lib/lista";
import { decidirOferta } from "../actions";
import {
  ofertaEmAberto,
  precoPedido,
  ROTULO_STATUS_OFERTA,
  ROTULO_TIPO_OFERTA,
  STATUS_OFERTA,
  type DecisaoOferta,
  type Oferta,
  type StatusOferta,
} from "../types";
import { OfertaStatusChip, ValorOferta } from "./oferta-chips";

export const ADMIN_OFERTAS = "/admin/ofertas";

const OPCOES_STATUS = STATUS_OFERTA.map((s) => ({ id: s, nome: ROTULO_STATUS_OFERTA[s] }));

/** Select "Situação" da toolbar (`?status=`). Fora do provider, só para os estados desabilitados. */
export function FiltroStatusOferta({
  valor,
  onChange,
  isDisabled,
}: {
  valor: StatusOferta | null;
  onChange?: (valor: string | null) => void;
  isDisabled?: boolean;
}) {
  return (
    <FiltroSelect
      label="Situação"
      value={valor}
      opcoes={OPCOES_STATUS}
      rotuloTodos="Todas"
      onChange={(v) => onChange?.(v)}
      isDisabled={isDisabled}
      className="w-full sm:w-52"
    />
  );
}

interface OfertasTabelaProps {
  page: Page<Oferta>;
  /** Contrato ativo das ofertas aceitas da página (`null` = ainda sem contrato). */
  contratos: Record<number, Contrato | null>;
  params: ListaParams;
}

export function OfertasTabela({ params, ...props }: OfertasTabelaProps) {
  return (
    <ListaProvider params={params}>
      <OfertasConteudo {...props} />
    </ListaProvider>
  );
}

const DECISOES: Record<
  DecisaoOferta,
  { titulo: string; rotulo: string; pendente: string; status: "accent" | "danger"; icone: React.ReactNode }
> = {
  ACEITA: {
    titulo: "Aceitar oferta?",
    rotulo: "Aceitar",
    pendente: "Aceitando…",
    status: "accent",
    icone: <CircleCheck className="size-4" aria-hidden />,
  },
  EM_ESPERA: {
    titulo: "Colocar oferta em espera?",
    rotulo: "Colocar em espera",
    pendente: "Salvando…",
    status: "accent",
    icone: <Clock className="size-4" aria-hidden />,
  },
  RECUSADA: {
    titulo: "Recusar oferta?",
    rotulo: "Recusar",
    pendente: "Recusando…",
    status: "danger",
    icone: <CircleXmark className="size-4" aria-hidden />,
  },
};

function OfertasConteudo({ page, contratos }: Omit<OfertasTabelaProps, "params">) {
  const router = useRouter();
  const { params, navegar } = useLista();
  const detalhe = useAlvo<Oferta>();
  const pdf = useAlvo<Contrato>();
  const [decisao, setDecisao] = useState<{ oferta: Oferta; status: DecisaoOferta; aberto: boolean } | null>(null);
  const { content, page: meta } = page;

  const decidir = (oferta: Oferta, status: DecisaoOferta) => setDecisao({ oferta, status, aberto: true });
  const fecharDecisao = () => setDecisao((d) => (d ? { ...d, aberto: false } : d));

  const vazio = () => {
    if (params.status) {
      return (
        <ListaVazia
          icone={CircleDollar}
          titulo={`Nenhuma oferta ${ROTULO_STATUS_OFERTA[params.status as StatusOferta].toLowerCase()}`}
          dica="Escolha outra situação ou veja todas as ofertas."
          acao={<Button variant="secondary" onPress={() => navegar({ status: "" })}>Ver todas</Button>}
        />
      );
    }
    if (meta.totalElements > 0) {
      return (
        <ListaVazia
          icone={CircleDollar}
          titulo="Página não encontrada"
          dica={`A lista tem ${meta.totalPages} página(s).`}
          acao={<Button variant="secondary" onPress={() => navegar({ pagina: 1 })}>Ir para a primeira página</Button>}
        />
      );
    }
    return (
      <ListaVazia
        icone={CircleDollar}
        titulo="Nenhuma oferta recebida"
        dica="Quando um cliente fizer uma oferta num imóvel, ela aparece aqui."
      />
    );
  };

  const d = decisao ? DECISOES[decisao.status] : DECISOES.ACEITA;

  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar>
        <FiltroStatusOferta
          valor={(params.status || null) as StatusOferta | null}
          onChange={(status) => navegar({ status: status ?? "" })}
        />
        <ListaContagem
          total={meta.totalElements}
          singular={params.status ? "oferta encontrada" : "oferta"}
          plural={params.status ? "ofertas encontradas" : "ofertas"}
        />
      </ListaToolbar>

      <ListaResultados>
        {content.length === 0 ? (
          vazio()
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Ofertas" className="min-w-[56rem]">
                <Table.Header>
                  <Table.Column isRowHeader>Imóvel</Table.Column>
                  <Table.Column>Cliente</Table.Column>
                  <Table.Column>Proposta</Table.Column>
                  <Table.Column>Recebida em</Table.Column>
                  <Table.Column>Situação</Table.Column>
                  <Table.Column className="text-end">Ações</Table.Column>
                </Table.Header>
                <Table.Body items={content}>
                  {(oferta) => {
                    const pedido = precoPedido(oferta.imovel, oferta.tipo);
                    const contrato = contratos[oferta.id];
                    // Só se aceita oferta de imóvel disponível (a API responde 409).
                    const disponivel = oferta.imovel.status === "DISPONIVEL";
                    return (
                      <Table.Row id={oferta.id}>
                        <Table.Cell>
                          <div className="flex min-w-0 flex-col items-start gap-1">
                            <span className="line-clamp-1 font-medium">{oferta.imovel.titulo}</span>
                            <span className="text-xs text-muted">
                              Cód. {oferta.imovel.id}
                              {pedido != null && ` · pedido ${formatCurrency(pedido)}`}
                            </span>
                            {!disponivel && <StatusChip status={oferta.imovel.status} />}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate">{oferta.usuario.nome}</span>
                            <span className="truncate text-xs text-muted">{oferta.usuario.email}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col items-start gap-1">
                            <ValorOferta valor={oferta.valorProposto} tipo={oferta.tipo} />
                            <span className="flex items-center gap-1.5 text-xs text-muted">
                              {ROTULO_TIPO_OFERTA[oferta.tipo]}
                              {pedido != null && <Diferenca valor={oferta.valorProposto} pedido={pedido} />}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-muted">{formatData(oferta.createdAt)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col items-start gap-1">
                            <OfertaStatusChip status={oferta.status} />
                            {contrato && <ContratoStatusChip status={contrato.status} />}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex justify-end gap-1">
                            <AcaoIcone label={`Ver oferta de ${oferta.usuario.nome}`} onPress={() => detalhe.abrir(oferta)}>
                              <Eye className="size-4" aria-hidden />
                            </AcaoIcone>
                            {ofertaEmAberto(oferta.status) && (
                              <>
                                <AcaoIcone
                                  label={
                                    disponivel
                                      ? `Aceitar oferta de ${oferta.usuario.nome}`
                                      : `Imóvel ${ROTULO_STATUS_IMOVEL[oferta.imovel.status].toLowerCase()}: não dá para aceitar`
                                  }
                                  isDisabled={!disponivel}
                                  onPress={() => decidir(oferta, "ACEITA")}
                                >
                                  <CircleCheck className={`size-4 ${disponivel ? "text-success" : ""}`} aria-hidden />
                                </AcaoIcone>
                                {oferta.status === "PENDENTE" && (
                                  <AcaoIcone label="Colocar em espera" onPress={() => decidir(oferta, "EM_ESPERA")}>
                                    <Clock className="size-4" aria-hidden />
                                  </AcaoIcone>
                                )}
                                <AcaoIcone label={`Recusar oferta de ${oferta.usuario.nome}`} onPress={() => decidir(oferta, "RECUSADA")}>
                                  <CircleXmark className="size-4 text-danger" aria-hidden />
                                </AcaoIcone>
                              </>
                            )}
                            {oferta.status === "ACEITA" &&
                              (contrato ? (
                                <AcaoIcone label="Ver contrato" onPress={() => pdf.abrir(contrato)}>
                                  <FileText className="size-4" aria-hidden />
                                </AcaoIcone>
                              ) : (
                                <AcaoIcone
                                  label="Criar contrato"
                                  variant="secondary"
                                  onPress={() => router.push(`${ADMIN_OFERTAS}/${oferta.id}/contrato`)}
                                >
                                  <FilePlus className="size-4" aria-hidden />
                                </AcaoIcone>
                              ))}
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

      <OfertaDetalhe oferta={detalhe.item} aberto={detalhe.aberto} onFechar={detalhe.fechar} />

      <PdfVisualizador
        aberto={pdf.aberto}
        onFechar={pdf.fechar}
        titulo={`Contrato da oferta nº ${pdf.item?.oferta.id ?? ""}`}
        descricao={pdf.item?.oferta.imovel.titulo}
        src={pdf.item ? hrefPdf(pdf.item.id) : null}
        hrefDownload={pdf.item ? hrefPdf(pdf.item.id, { baixar: true }) : undefined}
      />

      <ConfirmarAcao
        // Uma chave por decisão: o diálogo não herda o erro de outra oferta.
        key={decisao ? `${decisao.oferta.id}-${decisao.status}` : "nenhuma"}
        aberto={decisao?.aberto ?? false}
        onFechar={fecharDecisao}
        titulo={d.titulo}
        status={d.status}
        rotuloConfirmar={d.rotulo}
        rotuloPendente={d.pendente}
        icone={d.icone}
        onConfirmar={() => decidirOferta(decisao!.oferta.id, decisao!.status)}
      >
        {decisao && (
          <>
            Oferta de <strong className="text-foreground">{decisao.oferta.usuario.nome}</strong> de{" "}
            <strong className="text-foreground">
              {formatCurrency(decisao.oferta.valorProposto)}
              {decisao.oferta.tipo === "ALUGUEL" && "/mês"}
            </strong>{" "}
            por {decisao.oferta.imovel.titulo}.{" "}
            {decisao.status === "ACEITA" &&
              "O imóvel fica reservado e as outras ofertas pendentes dele vão para em espera. Depois, você cria o contrato para o cliente assinar. A decisão não pode ser desfeita."}
            {decisao.status === "EM_ESPERA" && "Ela continua em aberto: você ainda pode aceitar ou recusar depois."}
            {decisao.status === "RECUSADA" && "O cliente verá a oferta como recusada. Isso não pode ser desfeito."}
          </>
        )}
      </ConfirmarAcao>
    </div>
  );
}

/** "−5% do pedido" / "+2% do pedido" / "= pedido". */
function Diferenca({ valor, pedido }: { valor: number; pedido: number }) {
  const pct = Math.round(((valor - pedido) / pedido) * 100);
  if (pct === 0) return <span>· igual ao pedido</span>;
  return (
    <span className={pct < 0 ? "text-warning" : "text-success"}>
      · {pct > 0 ? "+" : "−"}
      {Math.abs(pct)}% do pedido
    </span>
  );
}

function OfertaDetalhe({ oferta, aberto, onFechar }: { oferta: Oferta | null; aberto: boolean; onFechar: () => void }) {
  if (!oferta) return null;
  const pedido = precoPedido(oferta.imovel, oferta.tipo);
  const linhas: [string, React.ReactNode][] = [
    ["Imóvel", `${oferta.imovel.titulo} (cód. ${oferta.imovel.id})`],
    ["Cliente", `${oferta.usuario.nome} · ${oferta.usuario.email}`],
    ["Negócio", ROTULO_TIPO_OFERTA[oferta.tipo]],
    ["Valor proposto", <ValorOferta key="v" valor={oferta.valorProposto} tipo={oferta.tipo} />],
    ["Preço anunciado", pedido != null ? formatCurrency(pedido) : "Sem preço anunciado"],
    ["Recebida em", formatDataHora(oferta.createdAt)],
    ["Atualizada em", formatDataHora(oferta.updatedAt)],
  ];

  return (
    <Modal isOpen={aberto} onOpenChange={(open) => !open && onFechar()}>
      <Modal.Backdrop>
        <Modal.Container size="md" scroll="inside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header className="flex flex-row items-center justify-between gap-3 pr-10">
              <Modal.Heading>Oferta nº {oferta.id}</Modal.Heading>
              <OfertaStatusChip status={oferta.status} />
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
                {linhas.map(([rotulo, valor]) => (
                  <div key={rotulo} className="contents">
                    <dt className="text-muted">{rotulo}</dt>
                    <dd className="font-medium">{valor}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-muted">Mensagem do cliente</p>
                {oferta.mensagem ? (
                  <p className="whitespace-pre-line rounded-xl bg-surface-secondary p-3 text-sm">{oferta.mensagem}</p>
                ) : (
                  <Chip size="sm" variant="soft">
                    Sem mensagem
                  </Chip>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onFechar}>
                Fechar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
