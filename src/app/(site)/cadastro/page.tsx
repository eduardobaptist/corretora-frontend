import { Card, Skeleton } from "@heroui/react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CadastroForm } from "@/features/auth/components/cadastro-form";
import { destinoSeguro } from "@/features/auth/utils";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage({ searchParams }: PageProps<"/cadastro">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm gap-6 p-6">
        <Card.Header className="gap-1 text-center">
          <Card.Title className="text-2xl font-bold tracking-tight">Criar conta</Card.Title>
          <Card.Description>É rápido: nome, e-mail e uma senha.</Card.Description>
        </Card.Header>
        <Card.Content>
          {/* ?next= é dado de request: fica dentro do Suspense */}
          <Suspense fallback={<CadastroFormSkeleton />}>
            <CadastroConteudo searchParams={searchParams} />
          </Suspense>
        </Card.Content>
      </Card>
    </main>
  );
}

async function CadastroConteudo({ searchParams }: Pick<PageProps<"/cadastro">, "searchParams">) {
  const { next } = await searchParams;
  return <CadastroForm next={destinoSeguro(Array.isArray(next) ? next[0] : next) ?? undefined} />;
}

function CadastroFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="mt-2 h-10 w-full rounded-full" />
    </div>
  );
}
