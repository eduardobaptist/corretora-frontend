import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import {
  TiposImoveisSection,
  TiposImoveisSkeleton,
} from "@/features/tipos-imoveis/components/tipos-imoveis-section";

export const metadata: Metadata = { title: "Tipos de imóvel" };

export default function AdminTiposImoveis({ searchParams }: PageProps<"/admin/tipos-imoveis">) {
  return (
    <>
      <AreaCabecalho titulo="Tipos de imóvel" descricao="Categorias usadas no cadastro de imóveis." />
      <Suspense fallback={<TiposImoveisSkeleton />}>
        <TiposImoveisSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}
