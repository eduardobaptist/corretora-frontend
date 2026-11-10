import type { Metadata } from "next";
import { AreaPagina } from "@/features/auth/components/area-shell";

export const metadata: Metadata = { title: "Imóveis" };

export default function AdminImoveis() {
  return <AreaPagina titulo="Imóveis" descricao="Cadastre, edite e exclua imóveis e gerencie as fotos." />;
}
