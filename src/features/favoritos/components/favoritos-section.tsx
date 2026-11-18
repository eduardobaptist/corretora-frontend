import { unstable_rethrow } from "next/navigation";
import { ListaErro } from "@/components/admin/lista-estados";
import { comoCliente } from "@/features/auth/api";
import { ImoveisGrid } from "@/features/imoveis/components/imoveis-grid";
import { ImovelCard } from "@/features/imoveis/components/imovel-card";
import { ImovelCardSkeleton } from "@/features/imoveis/components/imovel-card-skeleton";
import type { Imovel } from "@/features/imoveis/types";
import { hrefImovel, TAMANHO_PAGINA } from "@/features/imoveis/vitrine-params";
import { ApiError, type Page } from "@/lib/api";
import { parseListaParams } from "@/lib/lista";
import { listarFavoritos } from "../api";
import { FavoritoBotao } from "./favorito-botao";
import { FavoritosLista } from "./favoritos-lista";

const VITRINE = "/cliente/vitrine";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Imóveis favoritos do cliente (GET /favoritos), em cards como na vitrine. */
export async function FavoritosSection({ searchParams }: { searchParams: SearchParams }) {
  const params = parseListaParams(await searchParams);

  let page: Page<Imovel>;
  try {
    page = await comoCliente((auth) => listarFavoritos(auth, params.pagina - 1, TAMANHO_PAGINA));
  } catch (error) {
    unstable_rethrow(error);
    return (
      <ListaErro
        titulo="Não foi possível carregar seus favoritos"
        mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
      />
    );
  }

  const { content, page: meta } = page;

  // Os estados vazios ficam no FavoritosLista (client): `ListaVazia` recebe o ícone como componente,
  // e função não atravessa de Server para Client Component.
  return (
    <FavoritosLista params={params} page={meta} vitrine={VITRINE}>
      <ImoveisGrid>
        {content.map((imovel, i) => (
          <ImovelCard
            key={imovel.id}
            imovel={imovel}
            href={hrefImovel(VITRINE, imovel.id)}
            priority={i < 3}
            acao={<FavoritoBotao imovelId={imovel.id} titulo={imovel.titulo} favorito />}
          />
        ))}
      </ImoveisGrid>
    </FavoritosLista>
  );
}

export function FavoritosSkeleton() {
  return (
    <ImoveisGrid>
      {Array.from({ length: 6 }, (_, i) => (
        <ImovelCardSkeleton key={i} />
      ))}
    </ImoveisGrid>
  );
}
