import type { Metadata } from "next";
import { AreaPagina } from "@/features/auth/components/area-shell";

export const metadata: Metadata = { title: "Meu perfil" };

export default function ClientePerfil() {
  return <AreaPagina titulo="Meu perfil" descricao="Seus dados de acesso." />;
}
