import { EmptyState } from "@heroui/react";
import Link from "next/link";
import { House } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="container-site flex flex-1 flex-col py-10">
      <EmptyState className="flex flex-col items-center gap-2 py-24 text-center">
        <House className="size-8 text-muted" aria-hidden />
        <h1 className="font-medium">Página não encontrada</h1>
        <p className="text-sm text-muted">O imóvel pode ter sido removido ou o endereço está incorreto.</p>
        <Link href="/" className="button button--secondary button--sm mt-2">
          Ver todos os imóveis
        </Link>
      </EmptyState>
    </main>
  );
}
