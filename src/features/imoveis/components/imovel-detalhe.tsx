import { Alert, Breadcrumbs, Card, Chip, Separator, Skeleton } from "@heroui/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, GeoPin, StarFill } from "@/components/icons";
import { FavoritoDetalhe } from "@/features/favoritos/components/favorito-detalhe";
import { OfertaBloco } from "@/features/ofertas/components/oferta-bloco";
import { ApiError } from "@/lib/api";
import { buscarImovel } from "../api";
import { ROTULO_STATUS_IMOVEL, type Imovel } from "../types";
import { formatEndereco, parseCaracteristicas } from "../utils";
import { ContatoImovel } from "./contato-form";
import { ImovelAtributos } from "./imovel-atributos";
import { ImovelGaleria } from "./imovel-galeria";
import { Preco } from "./preco";
import { StatusChip } from "./status-chip";
import { hrefImovel } from "../vitrine-params";

export async function ImovelDetalhe({
  params,
  base = "/",
}: {
  params: Promise<{ id: string }>;
  /** caminho da listagem de onde o usuário veio (site ou área logada) */
  base?: string;
}) {
  const { id } = await params;

  let imovel: Imovel | null;
  try {
    imovel = await buscarImovel(id);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Erro inesperado.";
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Não foi possível carregar o imóvel</Alert.Title>
          <Alert.Description>{message} Tente novamente em instantes.</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  if (!imovel) notFound();
  /** Este detalhe (volta do login para cá). */
  const aqui = hrefImovel(base, imovel.id);

  const caracteristicas = parseCaracteristicas(imovel);
  const temPreco = imovel.precoVenda != null || imovel.precoAluguel != null;
  const detalhes: [string, string | null][] = [
    ["Código", String(imovel.id)],
    ["Tipo", imovel.tipoImovel?.nome ?? null],
    ["Finalidade", imovel.finalidade],
    ["Situação", ROTULO_STATUS_IMOVEL[imovel.status]],
    ["Complemento", imovel.complemento],
    ["CEP", imovel.cep],
  ];

  return (
    <div className="@container/detalhe flex flex-col gap-6">
      {/* Celular: link de voltar (breadcrumbs com título longo estouram a largura) */}
      <Link
        href={base}
        className="flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground sm:hidden"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar para os imóveis
      </Link>
      <Breadcrumbs className="hidden sm:flex">
        <Breadcrumbs.Item href={base}>Imóveis</Breadcrumbs.Item>
        {imovel.tipoImovel && (
          <Breadcrumbs.Item href={`${base}?tipo=${imovel.tipoImovel.id}`}>
            {imovel.tipoImovel.nome}
          </Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item>{imovel.titulo}</Breadcrumbs.Item>
      </Breadcrumbs>

      <div className="grid items-start gap-8 @4xl/detalhe:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <ImovelGaleria fotos={imovel.fotos} titulo={imovel.titulo} />

          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {imovel.tipoImovel && (
                <Chip size="sm" variant="secondary">
                  {imovel.tipoImovel.nome}
                </Chip>
              )}
              <StatusChip status={imovel.status} />
              {imovel.destaque && (
                <Chip size="sm" color="accent" variant="primary">
                  <StarFill className="size-3" aria-hidden />
                  <Chip.Label>Destaque</Chip.Label>
                </Chip>
              )}
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{imovel.titulo}</h1>
              {/* Lê a sessão: não segura o resto do detalhe */}
              <Suspense fallback={null}>
                <FavoritoDetalhe imovelId={imovel.id} titulo={imovel.titulo} href={aqui} />
              </Suspense>
            </div>
            <p className="flex items-center gap-1.5 text-muted">
              <GeoPin className="size-4 shrink-0" aria-hidden />
              {formatEndereco(imovel)}
            </p>
            {/* Celular/tablet: preço logo abaixo do título (no desktop fica no card lateral) */}
            {temPreco && (
              <div className="mt-2 flex flex-wrap gap-x-8 gap-y-3 @4xl/detalhe:hidden">
                <Preco rotulo="Venda" valor={imovel.precoVenda} tamanho="lg" />
                <Preco rotulo="Aluguel" valor={imovel.precoAluguel} sufixo="/mês" tamanho="lg" />
              </div>
            )}
          </header>

          <ImovelAtributos imovel={imovel} />

          {imovel.descricao && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Sobre o imóvel</h2>
              <p className="whitespace-pre-line leading-relaxed text-foreground">
                {imovel.descricao}
              </p>
            </section>
          )}

          {caracteristicas.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Características</h2>
              <div className="flex flex-wrap gap-2">
                {caracteristicas.map((c) => (
                  <Chip key={c} variant="soft">
                    {c}
                  </Chip>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Detalhes</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              {detalhes
                .filter(([, valor]) => valor)
                .map(([rotulo, valor]) => (
                  <div key={rotulo} className="flex flex-col gap-0.5">
                    <dt className="text-xs text-muted">{rotulo}</dt>
                    <dd className="font-medium">{valor}</dd>
                  </div>
                ))}
            </dl>
          </section>
        </div>

        <aside
          aria-label="Preço, oferta e contato"
          className="@4xl/detalhe:sticky @4xl/detalhe:top-(--topo-fixo) @4xl/detalhe:max-h-[calc(100dvh-var(--topo-fixo)-1rem)] @4xl/detalhe:overflow-y-auto"
        >
          <Card className="gap-5">
            {temPreco && (
              <div className="hidden flex-col gap-5 @4xl/detalhe:flex">
                <div className="flex flex-col gap-3">
                  <Preco rotulo="Venda" valor={imovel.precoVenda} tamanho="lg" />
                  <Preco rotulo="Aluguel" valor={imovel.precoAluguel} sufixo="/mês" tamanho="lg" />
                </div>
                <Separator />
              </div>
            )}
            <Suspense fallback={null}>
              <OfertaBloco imovel={imovel} href={aqui} />
            </Suspense>
            <div className="flex flex-col gap-1">
              <h2 className="font-semibold">Gostou deste imóvel?</h2>
              <p className="text-sm text-muted">Fale com um corretor, sem compromisso.</p>
            </div>
            <ContatoImovel imovelId={imovel.id} titulo={imovel.titulo} />
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function ImovelDetalheSkeleton() {
  return (
    <div className="@container/detalhe flex flex-col gap-6">
      <Skeleton className="h-4 w-56 rounded-md" />
      <div className="grid items-start gap-8 @4xl/detalhe:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-8">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-8 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-11 rounded-xl" />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        </div>
        <Card className="gap-4">
          <Skeleton className="h-8 w-2/3 rounded-md" />
          <Skeleton className="h-8 w-1/2 rounded-md" />
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
          <Skeleton className="h-10 w-full rounded-full" />
        </Card>
      </div>
    </div>
  );
}
