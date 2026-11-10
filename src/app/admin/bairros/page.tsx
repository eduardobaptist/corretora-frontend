import type { Metadata } from "next";
import { AreaPagina } from "@/features/auth/components/area-shell";

export const metadata: Metadata = { title: "Bairros" };

export default function AdminBairros() {
  return <AreaPagina titulo="Bairros" descricao="Bairros, cidades e faixas de CEP atendidos." />;
}
