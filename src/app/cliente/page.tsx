import type { Metadata } from "next";
import { AreaPagina } from "@/features/auth/components/area-shell";

export const metadata: Metadata = { title: "Início" };

export default function ClienteInicio() {
  return <AreaPagina titulo="Início" descricao="Bem-vindo à sua área." />;
}
