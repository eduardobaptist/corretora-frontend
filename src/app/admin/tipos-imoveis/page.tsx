import type { Metadata } from "next";
import { AreaPagina } from "@/features/auth/components/area-shell";

export const metadata: Metadata = { title: "Tipos de imóvel" };

export default function AdminTiposImoveis() {
  return <AreaPagina titulo="Tipos de imóvel" descricao="Categorias usadas no cadastro de imóveis." />;
}
