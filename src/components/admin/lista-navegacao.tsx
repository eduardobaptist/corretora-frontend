"use client";

import { SearchField } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useCallback, useEffect, useState, useTransition } from "react";
import { Paginacao } from "@/components/paginacao";
import type { PageMetadata } from "@/lib/api";
import { toListaSearchParams, type ListaParams } from "@/lib/lista";

// Mesmo modelo da vitrine: a URL (?pagina=, ?q=) é a fonte da verdade. Os controles só navegam;
// o Server Component relê os searchParams. A transição mantém a tabela atual (esmaecida).

interface ListaContextValue {
  params: ListaParams;
  /** Aplica o patch e volta para a página 1, salvo se o patch trouxer `pagina`. */
  navegar: (patch: Partial<ListaParams>, opcoes?: { replace?: boolean; scroll?: boolean }) => void;
  isPending: boolean;
}

const ListaContext = createContext<ListaContextValue | null>(null);

export function useLista() {
  const ctx = use(ListaContext);
  if (!ctx) throw new Error("useLista precisa estar dentro de <ListaProvider>.");
  return ctx;
}

export function ListaProvider({ params, children }: { params: ListaParams; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const navegar = useCallback<ListaContextValue["navegar"]>(
    (patch, { replace = false, scroll = false } = {}) => {
      const qs = toListaSearchParams({ ...params, pagina: 1, ...patch }).toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      startTransition(() => {
        if (replace) router.replace(href, { scroll });
        else router.push(href, { scroll });
      });
    },
    [params, pathname, router],
  );

  return <ListaContext value={{ params, navegar, isPending }}>{children}</ListaContext>;
}

/** Esmaece a tabela enquanto a próxima consulta carrega. */
export function ListaResultados({ children }: { children: React.ReactNode }) {
  const { isPending } = useLista();
  return (
    <div
      aria-busy={isPending}
      className={`flex flex-col gap-4 transition-opacity ${isPending ? "pointer-events-none opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}

export function ListaPaginacao({ page }: { page: PageMetadata }) {
  const { params, navegar } = useLista();
  return (
    <Paginacao
      atual={params.pagina}
      totalPaginas={page.totalPages}
      totalItens={page.totalElements}
      tamanho={page.size}
      onIr={(pagina) => navegar({ pagina }, { scroll: true })}
    />
  );
}

const ESPERA_MS = 350;

/** Busca ligada a `?q=`, com debounce enquanto digita. */
export function ListaBusca({ label, placeholder }: { label: string; placeholder: string }) {
  const { params, navegar } = useLista();
  const [busca, setBusca] = useState(params.q);

  // Sincroniza quando o ?q= muda por fora (ex.: "Limpar busca", voltar no histórico).
  const [qAnterior, setQAnterior] = useState(params.q);
  if (params.q !== qAnterior) {
    setQAnterior(params.q);
    if (params.q !== busca.trim()) setBusca(params.q);
  }

  useEffect(() => {
    if (busca.trim() === params.q) return;
    const t = setTimeout(() => navegar({ q: busca.trim() }, { replace: true }), ESPERA_MS);
    return () => clearTimeout(t);
  }, [busca, params.q, navegar]);

  return <BuscaCampo label={label} placeholder={placeholder} value={busca} onChange={setBusca} />;
}

export function BuscaCampo({
  label,
  placeholder,
  value,
  onChange,
  isDisabled,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
}) {
  return (
    <SearchField
      aria-label={label}
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      className="w-full sm:max-w-sm"
    >
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder={placeholder} />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
