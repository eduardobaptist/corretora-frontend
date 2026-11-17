import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import {
  ImovelFormSection,
  ImovelFormSkeleton,
  VoltarParaImoveis,
} from "@/features/imoveis/admin/components/imovel-form-section";

export const metadata: Metadata = { title: "Novo imóvel" };

export default function NovoImovel() {
  return (
    <>
      <VoltarParaImoveis />
      <AreaCabecalho titulo="Novo imóvel" descricao="As fotos ainda não podem ser enviadas por aqui." />
      <Suspense fallback={<ImovelFormSkeleton />}>
        <ImovelFormSection />
      </Suspense>
    </>
  );
}
