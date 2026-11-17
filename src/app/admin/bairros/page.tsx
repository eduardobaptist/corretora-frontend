import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import { BairrosSection, BairrosSkeleton } from "@/features/bairros/components/bairros-section";

export const metadata: Metadata = { title: "Bairros" };

export default function AdminBairros({ searchParams }: PageProps<"/admin/bairros">) {
  return (
    <>
      <AreaCabecalho titulo="Bairros" descricao="Bairros, cidades e faixas de CEP atendidos." />
      <Suspense fallback={<BairrosSkeleton />}>
        <BairrosSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}
