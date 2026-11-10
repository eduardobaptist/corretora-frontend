import { Alert, Card, Skeleton } from "@heroui/react";
import { ApiError } from "@/lib/api";
import { consultarVitrine, type ResultadoVitrine } from "../api";
import { hrefImovel, parseVitrineParams } from "../vitrine-params";
import { ImoveisGrid } from "./imoveis-grid";
import { ImoveisSearch } from "./imoveis-search";
import { ImovelCard } from "./imovel-card";
import { ImovelCardSkeleton } from "./imovel-card-skeleton";
import { VitrineBusca } from "./vitrine-busca";
import { VitrineFiltros } from "./vitrine-filtros";
import { VitrineProvider, VitrineResultados } from "./vitrine-navegacao";
import { VitrinePaginacao } from "./vitrine-paginacao";
import { VitrineToolbar } from "./vitrine-toolbar";
import { VitrineVazia } from "./vitrine-vazia";

type SearchParams = Record<string, string | string[] | undefined>;

// Server Component: lê a URL, consulta a API e entrega os dados aos controles (client).
export async function VitrineSection({
  searchParams,
  base = "/",
}: {
  searchParams: Promise<SearchParams>;
  /** caminho da listagem (ver `hrefImovel`) */
  base?: string;
}) {
  const params = parseVitrineParams(await searchParams);

  let resultado: ResultadoVitrine;
  try {
    resultado = await consultarVitrine(params);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Erro inesperado.";
    return (
      <div className="flex flex-col gap-8">
        <ImoveisSearch isDisabled />
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Não foi possível carregar os imóveis</Alert.Title>
            <Alert.Description>{message} Tente novamente em instantes.</Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
    );
  }

  const { pagina, opcoes } = resultado;
  const { content, page } = pagina;

  return (
    <VitrineProvider params={params}>
      <div className="@container/vitrine flex flex-col gap-8">
        <VitrineBusca />

        <div className="grid items-start gap-6 @4xl/vitrine:grid-cols-[17rem_minmax(0,1fr)] @4xl/vitrine:gap-8">
          <VitrineFiltros opcoes={opcoes} />

          <div className="flex min-w-0 flex-col gap-4">
            <VitrineToolbar total={page.totalElements} />
            <VitrineResultados>
              {content.length > 0 ? (
                <ImoveisGrid>
                  {content.map((imovel, i) => (
                    <ImovelCard
                      key={imovel.id}
                      imovel={imovel}
                      href={hrefImovel(base, imovel.id)}
                      priority={i < 3}
                    />
                  ))}
                </ImoveisGrid>
              ) : (
                <VitrineVazia totalItens={page.totalElements} />
              )}
            </VitrineResultados>
            <VitrinePaginacao
              atual={page.number + 1}
              totalPaginas={page.totalPages}
              totalItens={page.totalElements}
              tamanho={page.size}
            />
          </div>
        </div>
      </div>
    </VitrineProvider>
  );
}

export function VitrineSectionSkeleton() {
  return (
    <div className="@container/vitrine flex flex-col gap-8">
      <ImoveisSearch isDisabled />
      <div className="grid items-start gap-6 @4xl/vitrine:grid-cols-[17rem_minmax(0,1fr)] @4xl/vitrine:gap-8">
        <Card className="hidden gap-5 @4xl/vitrine:flex">
          <Skeleton className="h-5 w-20 rounded-md" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </Card>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-9 w-48 rounded-md" />
          </div>
          <ImoveisGrid>
            {Array.from({ length: 6 }, (_, i) => (
              <ImovelCardSkeleton key={i} />
            ))}
          </ImoveisGrid>
        </div>
      </div>
    </div>
  );
}
