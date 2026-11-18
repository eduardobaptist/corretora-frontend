import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import { OfertasSection, OfertasSkeleton } from "@/features/ofertas/components/ofertas-section";

export const metadata: Metadata = { title: "Ofertas" };

export default function AdminOfertas({ searchParams }: PageProps<"/admin/ofertas">) {
  return (
    <>
      <AreaCabecalho
        titulo="Ofertas"
        descricao="Propostas de compra e aluguel dos clientes. Aceite para criar o contrato."
      />
      <Suspense fallback={<OfertasSkeleton />}>
        <OfertasSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}
