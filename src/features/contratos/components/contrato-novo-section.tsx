import { Alert, buttonVariants, Card, Skeleton } from "@heroui/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@/components/icons";
import { comoAdmin } from "@/features/auth/api";
import { buscarOferta } from "@/features/ofertas/api";
import { OfertaStatusChip, ValorOferta } from "@/features/ofertas/components/oferta-chips";
import { precoPedido, ROTULO_STATUS_OFERTA, ROTULO_TIPO_OFERTA, type Oferta } from "@/features/ofertas/types";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDataHora } from "@/lib/format";
import { contratoAtivoDaOferta } from "../api";
import { ROTULO_STATUS_CONTRATO, type Contrato } from "../types";
import { ContratoForm } from "./contrato-form";

const VOLTAR = "/admin/ofertas";

/** Criar o contrato de uma oferta aceita: resumo da oferta + formulário (gerar ou enviar PDF). */
export async function ContratoNovoSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let dados: { oferta: Oferta; ativo: Contrato | null } | null;
  try {
    dados = await comoAdmin(async (auth) => {
      try {
        const oferta = await buscarOferta(auth, Number(id));
        return { oferta, ativo: await contratoAtivoDaOferta(auth, oferta.id) };
      } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
        throw error;
      }
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <Moldura>
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Não foi possível carregar a oferta</Alert.Title>
            <Alert.Description>{error.message} Tente novamente em instantes.</Alert.Description>
          </Alert.Content>
        </Alert>
      </Moldura>
    );
  }
  if (!dados) notFound();

  const { oferta, ativo } = dados;
  const pedido = precoPedido(oferta.imovel, oferta.tipo);

  return (
    <Moldura>
      <Card className="gap-4 p-5 sm:p-6">
        <Card.Header className="flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Card.Title className="text-base">Oferta nº {oferta.id}</Card.Title>
            <Card.Description>
              {oferta.imovel.titulo} (cód. {oferta.imovel.id})
            </Card.Description>
          </div>
          <OfertaStatusChip status={oferta.status} />
        </Card.Header>
        <Card.Content>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <Dado rotulo="Cliente">
              {oferta.usuario.nome}
              <span className="block truncate text-xs font-normal text-muted">{oferta.usuario.email}</span>
            </Dado>
            <Dado rotulo={ROTULO_TIPO_OFERTA[oferta.tipo]}>
              <ValorOferta valor={oferta.valorProposto} tipo={oferta.tipo} />
            </Dado>
            <Dado rotulo="Preço anunciado">{pedido != null ? formatCurrency(pedido) : "Sem preço"}</Dado>
            <Dado rotulo="Recebida em">{formatDataHora(oferta.createdAt)}</Dado>
          </dl>
        </Card.Content>
      </Card>

      {oferta.status !== "ACEITA" ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Esta oferta não está aceita</Alert.Title>
            <Alert.Description>
              Ela está {ROTULO_STATUS_OFERTA[oferta.status].toLowerCase()}. Só é possível criar contrato para uma oferta
              aceita.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : ativo ? (
        <Alert status="accent">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Esta oferta já tem contrato</Alert.Title>
            <Alert.Description>
              O contrato nº {ativo.id} está {ROTULO_STATUS_CONTRATO[ativo.status].toLowerCase()}. Cada oferta tem um
              só contrato (cancelar o contrato também cancela a oferta).
            </Alert.Description>
          </Alert.Content>
          <Link
            href="/admin/contratos"
            className={`${buttonVariants({ variant: "secondary", size: "sm" })} self-center`}
          >
            Ir para Contratos
          </Link>
        </Alert>
      ) : (
        <ContratoForm ofertaId={oferta.id} aluguel={oferta.tipo === "ALUGUEL"} />
      )}
    </Moldura>
  );
}

function Moldura({ children }: { children: React.ReactNode }) {
  return <div className="flex max-w-4xl flex-col gap-6">{children}</div>;
}

function Dado({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

export function VoltarParaOfertas() {
  return (
    <Link
      href={VOLTAR}
      className="flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Ofertas
    </Link>
  );
}

export function ContratoNovoSkeleton() {
  return (
    <Moldura>
      <Card className="gap-4 p-5 sm:p-6">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-9 rounded-md" />
          ))}
        </div>
      </Card>
      <Card className="gap-4 p-5 sm:p-6">
        <Skeleton className="h-9 w-72 rounded-md" />
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </Card>
    </Moldura>
  );
}
