import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import {
  MinhasOfertasSection,
  MinhasOfertasSkeleton,
} from "@/features/ofertas/components/minhas-ofertas-section";

export const metadata: Metadata = { title: "Minhas ofertas" };

export default function ClienteOfertas({ searchParams }: PageProps<"/cliente/ofertas">) {
  return (
    <>
      <AreaCabecalho
        titulo="Minhas ofertas"
        descricao="Acompanhe a resposta da corretora. Enquanto estiver pendente ou em espera, você pode cancelar."
      />
      <Suspense fallback={<MinhasOfertasSkeleton />}>
        <MinhasOfertasSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}
