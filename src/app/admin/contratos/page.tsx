import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import { ContratosSection, ContratosSkeleton } from "@/features/contratos/components/contratos-section";

export const metadata: Metadata = { title: "Contratos" };

export default function AdminContratos({ searchParams }: PageProps<"/admin/contratos">) {
  return (
    <>
      <AreaCabecalho
        titulo="Contratos"
        descricao="Contratos enviados aos clientes. Os que ainda não foram assinados podem ser cancelados."
      />
      <Suspense fallback={<ContratosSkeleton area="admin" />}>
        <ContratosSection searchParams={searchParams} area="admin" />
      </Suspense>
    </>
  );
}
