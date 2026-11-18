"use client";

import { Button, buttonVariants } from "@heroui/react";
import Link from "next/link";
import { ListaContagem, ListaVazia } from "@/components/admin/lista-estados";
import { ListaPaginacao, ListaProvider, ListaResultados, useLista } from "@/components/admin/lista-navegacao";
import { Heart } from "@/components/icons";
import type { PageMetadata } from "@/lib/api";
import type { ListaParams } from "@/lib/lista";

interface FavoritosListaProps {
  params: ListaParams;
  page: PageMetadata;
  /** Link do "Ver a vitrine" no estado vazio. */
  vitrine: string;
  children: React.ReactNode;
}

/**
 * Contagem + paginação (`?pagina=`) em volta do grid de favoritos, que vem pronto do servidor.
 * Também os estados vazios (sem favoritos, página inexistente).
 */
export function FavoritosLista({ params, ...props }: FavoritosListaProps) {
  return (
    <ListaProvider params={params}>
      <FavoritosConteudo {...props} />
    </ListaProvider>
  );
}

function FavoritosConteudo({ page, vitrine, children }: Omit<FavoritosListaProps, "params">) {
  const { navegar } = useLista();

  if (page.totalElements === 0) {
    return (
      <ListaVazia
        icone={Heart}
        titulo="Nenhum imóvel favorito ainda"
        dica="Toque no coração de um imóvel na vitrine para guardá-lo aqui."
        acao={
          <Link href={vitrine} className={buttonVariants({ variant: "secondary" })}>
            Ver a vitrine
          </Link>
        }
      />
    );
  }

  // Página além da última (ex.: removeu o único favorito da última página).
  const foraDoFim = page.number >= page.totalPages;

  return (
    <div className="flex flex-col gap-4">
      <ListaContagem total={page.totalElements} singular="imóvel salvo" plural="imóveis salvos" />
      <ListaResultados>
        {foraDoFim ? (
          <ListaVazia
            icone={Heart}
            titulo="Página não encontrada"
            dica={`Seus favoritos têm ${page.totalPages} página(s).`}
            acao={<Button variant="secondary" onPress={() => navegar({ pagina: 1 })}>Ir para a primeira página</Button>}
          />
        ) : (
          children
        )}
        <ListaPaginacao page={page} />
      </ListaResultados>
    </div>
  );
}
