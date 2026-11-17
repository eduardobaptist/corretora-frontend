import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import {
  ImoveisAdminSection,
  ImoveisAdminSkeleton,
} from "@/features/imoveis/admin/components/imoveis-admin-section";

export const metadata: Metadata = { title: "Imóveis" };

export default function AdminImoveis({ searchParams }: PageProps<"/admin/imoveis">) {
  return (
    <>
      <AreaCabecalho titulo="Imóveis" descricao="Cadastre, edite e exclua os imóveis da vitrine." />
      <Suspense fallback={<ImoveisAdminSkeleton />}>
        <ImoveisAdminSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}
