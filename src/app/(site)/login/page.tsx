import { Card, Skeleton } from "@heroui/react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { destinoSeguro } from "@/features/auth/utils";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm gap-6 p-6">
        <Card.Header className="gap-1 text-center">
          <Card.Title className="text-2xl font-bold tracking-tight">Entrar</Card.Title>
          <Card.Description>Acesse sua conta para continuar.</Card.Description>
        </Card.Header>
        <Card.Content>
          {/* ?next= e ?motivo= são dados de request: ficam dentro do Suspense */}
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginConteudo searchParams={searchParams} />
          </Suspense>
        </Card.Content>
      </Card>
    </main>
  );
}

async function LoginConteudo({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const sp = await searchParams;
  const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return (
    <LoginForm
      next={destinoSeguro(primeiro(sp.next)) ?? undefined}
      expirado={primeiro(sp.motivo) === "expirado"}
    />
  );
}

function LoginFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="mt-2 h-10 w-full rounded-full" />
    </div>
  );
}
