import type { Metadata } from "next";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import { VitrinePagina } from "@/features/imoveis/components/paginas";

export const metadata: Metadata = { title: "Vitrine" };

export default function VitrineArea({ searchParams }: PageProps<"/admin/vitrine">) {
  return (
    <>
      <AreaCabecalho titulo="Vitrine" descricao="Imóveis disponíveis para comprar ou alugar." />
      <VitrinePagina searchParams={searchParams} base="/admin/vitrine" />
    </>
  );
}
