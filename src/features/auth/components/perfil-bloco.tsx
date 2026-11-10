import { Avatar, Button, Skeleton } from "@heroui/react";
import { ArrowRightFromSquare } from "@/components/icons";
import { sair } from "../actions";
import { exigirArea } from "../api";
import type { Area } from "../types";
import { iniciais } from "../utils";

/**
 * Bloco do usuário no rodapé da sidebar. Confirma sessão e papel na API (GET /auth/me):
 * é a checagem definitiva de acesso da área (o proxy só faz a otimista).
 */
export async function PerfilBloco({ area }: { area: Area }) {
  const usuario = await exigirArea(area);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        <Avatar color="accent">
          <Avatar.Fallback>{iniciais(usuario.nome)}</Avatar.Fallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-medium">{usuario.nome}</p>
          <p className="truncate text-xs text-muted">{usuario.email}</p>
        </div>
      </div>
      <form action={sair}>
        <Button type="submit" variant="danger-soft" fullWidth>
          <ArrowRightFromSquare className="size-4" aria-hidden />
          Sair
        </Button>
      </form>
    </div>
  );
}

export function PerfilBlocoSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
}
