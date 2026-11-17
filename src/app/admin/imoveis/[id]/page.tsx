import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import {
  ImovelFormSection,
  ImovelFormSkeleton,
  VoltarParaImoveis,
} from "@/features/imoveis/admin/components/imovel-form-section";

export const metadata: Metadata = { title: "Editar imóvel" };

export default function EditarImovel({ params }: PageProps<"/admin/imoveis/[id]">) {
  return (
    <>
      <VoltarParaImoveis />
      <AreaCabecalho titulo="Editar imóvel" descricao="As alterações aparecem na vitrine assim que salvar." />
      <Suspense fallback={<ImovelFormSkeleton />}>
        <ImovelFormSection params={params} />
      </Suspense>
    </>
  );
}
