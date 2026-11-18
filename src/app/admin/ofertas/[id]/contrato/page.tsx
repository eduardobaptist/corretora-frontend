import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import {
  ContratoNovoSection,
  ContratoNovoSkeleton,
  VoltarParaOfertas,
} from "@/features/contratos/components/contrato-novo-section";

export const metadata: Metadata = { title: "Novo contrato" };

export default function AdminNovoContrato({ params }: PageProps<"/admin/ofertas/[id]/contrato">) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <VoltarParaOfertas />
        <AreaCabecalho titulo="Novo contrato" descricao="Contrato da oferta aceita, para o cliente assinar." />
      </div>
      <Suspense fallback={<ContratoNovoSkeleton />}>
        <ContratoNovoSection params={params} />
      </Suspense>
    </>
  );
}
