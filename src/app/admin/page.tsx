import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import { PainelSection, PainelSkeleton } from "@/features/painel/components/painel-section";

export const metadata: Metadata = { title: "Painel" };

export default function AdminPainel() {
  return (
    <>
      <AreaCabecalho titulo="Painel" descricao="Visão geral da corretora: o que pede ação e como estão os imóveis e as ofertas." />
      <Suspense fallback={<PainelSkeleton />}>
        <PainelSection />
      </Suspense>
    </>
  );
}
