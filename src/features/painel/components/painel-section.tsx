import { Card, Chip, Skeleton } from "@heroui/react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { ListaErro } from "@/components/admin/lista-estados";
import { ArrowRight, CircleDollar, FileText, House, MapPin, Tags } from "@/components/icons";
import { comoAdmin } from "@/features/auth/api";
import { ROTULO_STATUS_IMOVEL, STATUS_IMOVEL } from "@/features/imoveis/types";
import { ApiError } from "@/lib/api";
import { carregarPainel, type DadosPainel } from "../api";
import { GraficoBarras } from "./grafico-barras";

const IMOVEIS = { singular: "imóvel", plural: "imóveis" };
const OFERTAS = { singular: "oferta", plural: "ofertas" };

const num = new Intl.NumberFormat("pt-BR");
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });

/** Painel do admin: indicadores do que pede ação + distribuição de imóveis e ofertas. */
export async function PainelSection() {
  let dados: DadosPainel;
  try {
    dados = await comoAdmin((auth) => carregarPainel(auth));
  } catch (error) {
    unstable_rethrow(error);
    return (
      <ListaErro
        titulo="Não foi possível carregar o painel"
        mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
      />
    );
  }

  return <PainelConteudo dados={dados} />;
}

/** O painel com os dados já carregados (separado para dar para renderizar com dados de exemplo). */
export function PainelConteudo({ dados }: { dados: DadosPainel }) {
  const { imoveis, ofertas, contratos } = dados;
  const disponiveis = imoveis.porStatus.DISPONIVEL;
  const outrosStatus = STATUS_IMOVEL.filter((s) => s !== "DISPONIVEL" && imoveis.porStatus[s] > 0)
    .map((s) => `${num.format(imoveis.porStatus[s])} ${ROTULO_STATUS_IMOVEL[s].toLowerCase()}${imoveis.porStatus[s] > 1 ? "s" : ""}`)
    .join(" · ");

  const { PENDENTE, EM_ESPERA, ACEITA, RECUSADA } = ofertas.contagem;
  const decididas = ACEITA + RECUSADA;

  return (
    <div className="@container flex flex-col gap-6">
      <div className="grid gap-4 @2xl:grid-cols-3">
        <Indicador
          icone={House}
          rotulo="Imóveis disponíveis"
          valor={disponiveis}
          complemento={`de ${num.format(imoveis.total)}`}
          proporcao={imoveis.total > 0 ? disponiveis / imoveis.total : undefined}
          apoio={outrosStatus || "Todos os imóveis recebem ofertas."}
          href="/admin/imoveis"
          acao="Ver imóveis"
        />
        <Indicador
          icone={CircleDollar}
          rotulo="Ofertas pendentes"
          valor={PENDENTE}
          destaque={PENDENTE > 0 ? "Pede ação" : undefined}
          apoio={EM_ESPERA > 0 ? `Mais ${num.format(EM_ESPERA)} em espera` : "Nenhuma em espera"}
          href="/admin/ofertas?status=PENDENTE"
          acao="Decidir ofertas"
        />
        <Indicador
          icone={FileText}
          rotulo="Aguardando assinatura"
          valor={contratos.aguardando}
          complemento={contratos.aguardando === 1 ? "contrato" : "contratos"}
          apoio={`${num.format(contratos.assinados)} ${contratos.assinados === 1 ? "assinado" : "assinados"} até agora`}
          href="/admin/contratos?status=AGUARDANDO_ASSINATURA"
          acao="Ver contratos"
        />
      </div>

      {/* Esquerda: imóveis (bairro e finalidade empilhados). Direita: ofertas, na altura toda. */}
      <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <GraficoBarras
            titulo="Imóveis por bairro"
            descricao="Dos bairros com mais imóveis para os com menos."
            icone={<MapPin aria-hidden />}
            itens={imoveis.porBairro}
            unidade={IMOVEIS}
            vazio="Nenhum imóvel cadastrado ainda."
          />
          <GraficoBarras
            titulo="Imóveis por finalidade"
            descricao="Como os imóveis cadastrados se dividem."
            icone={<Tags aria-hidden />}
            itens={imoveis.porFinalidade}
            unidade={IMOVEIS}
            vazio="Nenhum imóvel cadastrado ainda."
            comPercentual
          />
        </div>
        <div className="min-w-0">
          <GraficoBarras
            titulo="Ofertas por situação"
            descricao="Todas as ofertas, na ordem do fluxo."
            icone={<CircleDollar aria-hidden />}
            itens={ofertas.porStatus}
            unidade={OFERTAS}
            vazio="Nenhuma oferta recebida ainda."
            forma="colunas"
            preencher
            rodape={
              <dl className="grid grid-cols-3 divide-x divide-separator rounded-xl bg-surface-secondary py-3 text-center">
                <Resumo rotulo="Em aberto" valor={num.format(PENDENTE + EM_ESPERA)} />
                <Resumo rotulo="Decididas" valor={num.format(decididas)} />
                <Resumo
                  rotulo="Aceite"
                  valor={decididas > 0 ? pct.format(ACEITA / decididas) : "—"}
                  dica="Taxa de aceite: aceitas entre as aceitas e recusadas"
                />
              </dl>
            }
          />
        </div>
      </div>
    </div>
  );
}

function Resumo({ rotulo, valor, dica }: { rotulo: string; valor: string; dica?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 px-2" title={dica}>
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd className="text-lg font-semibold tracking-tight">{valor}</dd>
    </div>
  );
}

function Indicador({
  icone: Icone,
  rotulo,
  valor,
  complemento,
  proporcao,
  destaque,
  apoio,
  href,
  acao,
}: {
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  rotulo: string;
  valor: number;
  /** Ao lado do número, menor ("de 31", "contratos"). */
  complemento?: string;
  /** 0–1: medidor fino abaixo do número (trilho no mesmo tom da barra). */
  proporcao?: number;
  /** Chip de atenção no canto (ex.: "Pede ação"). */
  destaque?: string;
  apoio: string;
  href: string;
  acao: string;
}) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Icone className="size-5" aria-hidden />
          </span>
          {destaque && (
            <Chip size="sm" variant="soft" color="warning">
              {destaque}
            </Chip>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">{rotulo}</p>
          <p className="flex items-baseline gap-1.5">
            <span className="text-4xl font-semibold tracking-tight">{num.format(valor)}</span>
            {complemento && <span className="text-sm text-muted">{complemento}</span>}
          </p>
        </div>
        {proporcao != null && (
          <div
            role="meter"
            aria-label={`${rotulo}: ${pct.format(proporcao)} do total`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(proporcao * 100)}
            className="h-1.5 overflow-hidden rounded-full bg-accent/15"
          >
            <div className="h-full rounded-full bg-grafico" style={{ width: `${proporcao * 100}%` }} />
          </div>
        )}
        <p className="text-sm text-muted">{apoio}</p>
      </div>
      <Link
        href={href}
        className="group flex items-center justify-between border-t border-separator px-5 py-3 text-sm font-medium transition-colors hover:bg-surface-secondary"
      >
        {acao}
        <ArrowRight className="size-4 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </Card>
  );
}

const LARGURAS = ["w-full", "w-4/5", "w-3/5", "w-2/5", "w-1/4"];

function CabecalhoSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="size-9 shrink-0 rounded-xl" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
    </div>
  );
}

function BarrasSkeleton({ linhas }: { linhas: number }) {
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <CabecalhoSkeleton />
      <div className="flex flex-col gap-4">
        {Array.from({ length: linhas }, (_, i) => (
          <div key={i} className="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-3">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className={`h-5 rounded-md ${LARGURAS[i % LARGURAS.length]}`} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PainelSkeleton() {
  return (
    <div className="@container flex flex-col gap-6">
      <div className="grid gap-4 @2xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="gap-4 p-5">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-10 w-20 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <BarrasSkeleton linhas={6} />
          <BarrasSkeleton linhas={3} />
        </div>
        <Card className="gap-5 p-5 sm:p-6">
          <CabecalhoSkeleton />
          <div className="flex min-h-64 flex-1 items-end justify-around gap-4 px-4">
            {["h-3/4", "h-1/2", "h-2/3", "h-4/5", "h-1/5"].map((h, i) => (
              <Skeleton key={i} className={`w-6 rounded-t-md ${h}`} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
