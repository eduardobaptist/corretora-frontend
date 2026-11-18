"use client";

import { Button, Chip } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, type ComponentType, type SVGProps } from "react";
import {
  Bars,
  CircleDollar,
  FileText,
  Heart,
  House,
  LayoutCellsLarge,
  Magnifier,
  MapPin,
  Persons,
  Tags,
  Xmark,
} from "@/components/icons";
import { APP_NAME } from "@/lib/config";
import type { Area } from "../types";

interface ItemNav {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface SecaoNav {
  titulo: string;
  itens: ItemNav[];
}

// Opções de cada papel, conforme o que a API permite (docs/openapi.yaml):
// ADMIN gerencia imóveis (e fotos), bairros, tipos de imóvel e usuários, decide as ofertas e
// cria/cancela contratos. BASIC tem favoritos, as próprias ofertas e contratos (assina) e o que é
// público (vitrine). Seus dados aparecem no bloco de perfil do rodapé.
// A primeira opção é a raiz da área (ativa só na rota exata).
const NAV: Record<Area, { titulo: string; secoes: SecaoNav[] }> = {
  admin: {
    titulo: "Administração",
    secoes: [
      {
        titulo: "Geral",
        itens: [
          { href: "/admin", label: "Painel", icon: LayoutCellsLarge },
          { href: "/admin/vitrine", label: "Vitrine", icon: Magnifier },
        ],
      },
      {
        titulo: "Negócios",
        itens: [
          { href: "/admin/ofertas", label: "Ofertas", icon: CircleDollar },
          { href: "/admin/contratos", label: "Contratos", icon: FileText },
        ],
      },
      {
        titulo: "Cadastros",
        itens: [
          { href: "/admin/imoveis", label: "Imóveis", icon: House },
          { href: "/admin/bairros", label: "Bairros", icon: MapPin },
          { href: "/admin/tipos-imoveis", label: "Tipos de imóvel", icon: Tags },
          { href: "/admin/usuarios", label: "Usuários", icon: Persons },
        ],
      },
    ],
  },
  cliente: {
    titulo: "Minha conta",
    secoes: [
      {
        titulo: "Minha conta",
        itens: [
          { href: "/cliente", label: "Favoritos", icon: Heart },
          { href: "/cliente/vitrine", label: "Vitrine", icon: Magnifier },
          { href: "/cliente/ofertas", label: "Minhas ofertas", icon: CircleDollar },
          { href: "/cliente/contratos", label: "Contratos", icon: FileText },
        ],
      },
    ],
  },
};

function ativo(pathname: string, href: string, raiz: string) {
  return href === raiz ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sidebar das áreas logadas. Desktop: coluna fixa. Celular: barra no topo com menu.
 * `perfil` chega pronto do servidor (bloco do usuário, dentro de Suspense).
 */
export function AreaSidebar({ area, perfil }: { area: Area; perfil: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);

  return (
    <aside className="border-b border-border bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center justify-between gap-2 px-4 lg:px-5">
        <Link href="/" className="flex items-center gap-2 rounded-md font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <House className="size-4" aria-hidden />
          </span>
          {APP_NAME}
        </Link>
        {/* Papel só aparece para admin (cliente não precisa ser lembrado do próprio papel) */}
        {area === "admin" && (
          <Chip size="sm" variant="soft" color="accent" className="ml-auto lg:ml-0">
            Admin
          </Chip>
        )}
        <Button
          isIconOnly
          variant="ghost"
          className="lg:hidden"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          aria-controls="area-menu"
          onPress={() => setAberto((v) => !v)}
        >
          {aberto ? <Xmark className="size-5" aria-hidden /> : <Bars className="size-5" aria-hidden />}
        </Button>
      </div>

      <div
        id="area-menu"
        className={`${aberto ? "flex" : "hidden"} flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 lg:flex`}
      >
        {/* usePathname é dado de request nas rotas dinâmicas: o destaque do item ativo fica
            em Suspense; a casca estática mostra o menu sem destaque. */}
        <Suspense fallback={<AreaNav area={area} pathname={null} onNavegar={fechar} />}>
          <AreaNavAtiva area={area} onNavegar={fechar} />
        </Suspense>

        <div className="mt-auto">{perfil}</div>
      </div>
    </aside>
  );
}

function AreaNavAtiva(props: { area: Area; onNavegar: () => void }) {
  return <AreaNav {...props} pathname={usePathname()} />;
}

function AreaNav({
  area,
  pathname,
  onNavegar,
}: {
  area: Area;
  pathname: string | null;
  onNavegar: () => void;
}) {
  const { titulo, secoes } = NAV[area];
  const raiz = secoes[0].itens[0].href;

  return (
    <nav aria-label={titulo} className="flex flex-col gap-4">
      {secoes.map((secao) => (
        <div key={secao.titulo} className="flex flex-col gap-1">
          <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
            {secao.titulo}
          </p>
          {secao.itens.map(({ href, label, icon: Icon }) => {
            const atual = pathname != null && ativo(pathname, href, raiz);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavegar}
                aria-current={atual ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                  atual
                    ? "bg-accent/15 font-medium text-foreground [&>svg]:text-accent"
                    : "text-muted hover:bg-surface-secondary hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
