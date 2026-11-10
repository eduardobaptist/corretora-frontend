import type { Metadata } from "next";
import { AreaPagina } from "@/features/auth/components/area-shell";

export const metadata: Metadata = { title: "Painel" };

export default function AdminPainel() {
  return <AreaPagina titulo="Painel" descricao="Visão geral da corretora." />;
}
