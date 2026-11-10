"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useCallback, useState, useTransition } from "react";
import { toSearchParams, type VitrineParams } from "../vitrine-params";

// A URL é a fonte da verdade da vitrine: os controles só montam a nova query e navegam.
// O Server Component relê os searchParams e busca na API. A transição mantém a tela
// anterior visível (esmaecida) enquanto a próxima página chega.

interface NavegarOpcoes {
  /** replace: não empilha no histórico (usado na busca enquanto digita) */
  replace?: boolean;
  scroll?: boolean;
}

interface VitrineContextValue {
  params: VitrineParams;
  /** Aplica o patch e volta para a página 1, salvo se o patch trouxer `pagina`. */
  navegar: (patch: Partial<VitrineParams>, opcoes?: NavegarOpcoes) => void;
  isPending: boolean;
  filtrosAbertos: boolean;
  setFiltrosAbertos: (aberto: boolean) => void;
}

const VitrineContext = createContext<VitrineContextValue | null>(null);

export function useVitrine() {
  const ctx = use(VitrineContext);
  if (!ctx) throw new Error("useVitrine precisa estar dentro de <VitrineProvider>.");
  return ctx;
}

export function VitrineProvider({
  params,
  children,
}: {
  params: VitrineParams;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const navegar = useCallback(
    (patch: Partial<VitrineParams>, { replace = false, scroll = false }: NavegarOpcoes = {}) => {
      const qs = toSearchParams({ ...params, pagina: 1, ...patch }).toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      startTransition(() => {
        if (replace) router.replace(href, { scroll });
        else router.push(href, { scroll });
      });
    },
    [params, pathname, router],
  );

  return (
    <VitrineContext
      value={{ params, navegar, isPending, filtrosAbertos, setFiltrosAbertos }}
    >
      {children}
    </VitrineContext>
  );
}

/** Esmaece os resultados enquanto a próxima consulta carrega. */
export function VitrineResultados({ children }: { children: React.ReactNode }) {
  const { isPending } = useVitrine();
  return (
    <div
      aria-busy={isPending}
      className={`transition-opacity ${isPending ? "pointer-events-none opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}
