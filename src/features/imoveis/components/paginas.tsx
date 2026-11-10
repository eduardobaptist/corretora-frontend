import type { Metadata } from "next";
import { Suspense } from "react";
import { buscarImovel } from "../api";
import { ImovelDetalhe, ImovelDetalheSkeleton } from "./imovel-detalhe";
import { VitrineSection, VitrineSectionSkeleton } from "./vitrine-section";

// Vitrine e detalhe prontos para montar em qualquer rota (site e áreas logadas).
// Os dados de request (searchParams/params) ficam dentro do Suspense.

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function VitrinePagina({ searchParams, base }: { searchParams: SearchParams; base: string }) {
  return (
    <Suspense fallback={<VitrineSectionSkeleton />}>
      <VitrineSection searchParams={searchParams} base={base} />
    </Suspense>
  );
}

export function ImovelPagina({ params, base }: { params: Promise<{ id: string }>; base: string }) {
  return (
    <Suspense fallback={<ImovelDetalheSkeleton />}>
      <ImovelDetalhe params={params} base={base} />
    </Suspense>
  );
}

export async function metadataDoImovel(params: Promise<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const imovel = await buscarImovel(id).catch(() => null);
  if (!imovel) return { title: "Imóvel" };
  return {
    title: imovel.titulo,
    description: imovel.descricao ?? undefined,
    openGraph: imovel.fotos[0] ? { images: [imovel.fotos[0]] } : undefined,
  };
}
