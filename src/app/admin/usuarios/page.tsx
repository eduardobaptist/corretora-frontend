import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaCabecalho } from "@/features/auth/components/area-shell";
import { UsuariosSection, UsuariosSkeleton } from "@/features/usuarios/components/usuarios-section";

export const metadata: Metadata = { title: "Usuários" };

export default function AdminUsuarios({ searchParams }: PageProps<"/admin/usuarios">) {
  return (
    <>
      <AreaCabecalho titulo="Usuários" descricao="Contas de acesso e seus perfis (administrador ou cliente)." />
      <Suspense fallback={<UsuariosSkeleton />}>
        <UsuariosSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}
