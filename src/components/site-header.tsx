import { Skeleton } from "@heroui/react";
import Link from "next/link";
import { Suspense } from "react";
import { House } from "@/components/icons";
import { HeaderConta } from "@/features/auth/components/header-conta";
import { APP_NAME } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 rounded-md font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <House className="size-4" aria-hidden />
          </span>
          {APP_NAME}
        </Link>
        {/* Lê o cookie de sessão: fica em Suspense para o resto do header ser estático */}
        <Suspense fallback={<Skeleton className="h-8 w-24 rounded-full" />}>
          <HeaderConta />
        </Suspense>
      </div>
    </header>
  );
}
