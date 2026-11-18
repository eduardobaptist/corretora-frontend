import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import { ContratosSection, ContratosSkeleton } from "@/features/contratos/components/contratos-section";

export const metadata: Metadata = { title: "Contratos" };

export default function ClienteContratos({ searchParams }: PageProps<"/cliente/contratos">) {
  return (
    <>
      <AreaCabecalho titulo="Contratos" descricao="Leia e assine os contratos das ofertas aceitas." />
      <Suspense fallback={<ContratosSkeleton area="cliente" />}>
        <ContratosSection searchParams={searchParams} area="cliente" />
      </Suspense>
    </>
  );
}
