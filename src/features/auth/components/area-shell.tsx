import { EmptyState } from "@heroui/react";
import { Suspense } from "react";
import type { Area } from "../types";
import { AreaSidebar } from "./area-sidebar";
import { PerfilBloco, PerfilBlocoSkeleton } from "./perfil-bloco";

/**
 * Layout das áreas logadas: sidebar + conteúdo. A casca é estática; só o bloco de perfil
 * (que lê a sessão e chama a API) espera o request, dentro do Suspense.
 * Controle de acesso por papel ainda não existe: por enquanto só a sidebar muda.
 */
export function AreaShell({ area, children }: { area: Area; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <AreaSidebar
        area={area}
        perfil={
          <Suspense fallback={<PerfilBlocoSkeleton />}>
            <PerfilBloco area={area} />
          </Suspense>
        }
      />
      <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 [--topo-fixo:1.5rem] sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

/** Título + descrição de uma página de área. */
export function AreaCabecalho({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
      <p className="text-sm text-muted">{descricao}</p>
    </header>
  );
}

/** Página ainda sem conteúdo: título + "em breve". */
export function AreaPagina({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <>
      <AreaCabecalho titulo={titulo} descricao={descricao} />
      <EmptyState className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="font-medium">Em breve</p>
        <p className="text-sm text-muted">Esta seção ainda está sendo construída.</p>
      </EmptyState>
    </>
  );
}
