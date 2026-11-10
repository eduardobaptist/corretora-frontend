import type { Metadata } from "next";
import { AreaPagina } from "@/features/auth/components/area-shell";

export const metadata: Metadata = { title: "Usuários" };

export default function AdminUsuarios() {
  return <AreaPagina titulo="Usuários" descricao="Contas de acesso e seus papéis (administrador ou cliente)." />;
}
