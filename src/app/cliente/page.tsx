import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import { FavoritosSection, FavoritosSkeleton } from "@/features/favoritos/components/favoritos-section";

export const metadata: Metadata = { title: "Favoritos" };

// Início da área do cliente = os imóveis que ele favoritou.
export default function ClienteFavoritos({ searchParams }: PageProps<"/cliente">) {
  return (
    <>
      <AreaCabecalho titulo="Favoritos" descricao="Os imóveis que você salvou para ver depois." />
      <Suspense fallback={<FavoritosSkeleton />}>
        <FavoritosSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}
